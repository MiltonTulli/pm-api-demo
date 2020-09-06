'use strict'

const mongoose = require('mongoose')
const nock = require('nock')
const MockDate = require('mockdate')
const httpStatus = require('http-status')
const { PROVIDERS } = require('../../../../src/models/Patient/schemas/ehr-providers/EHRProviders.constants') // eslint-disable-line max-len
const {
  boot,
  cleanDB,
  expect,
  request,
  chance,
  app
} = require('../../../index')
const { userUtil, medfusionUtil, patientUtil } = require('../../../util')
const { cognito } = require('../../../util/aws')

const PATH = 'patients/:patientId/ehr-providers'
const MEDFUSION_PATH = `${PATH}/${PROVIDERS.MEDFUSION}`

describe(`POST ${PATH}/:provider`, () => {
  let User
  let Patient
  let user
  let patient
  let token
  let patientPath
  let forbiddenPatient
  let forbiddenPatientPath

  const buildPath = (patientId, provider) => `/patients/${patientId}/ehr-providers/${provider}`

  before(async () => {
    await boot()
    await cleanDB()
    User = mongoose.model('User')
    Patient = mongoose.model('Patient')
    if (!nock.isActive()) nock.activate()
  })

  beforeEach(async () => {
    user = await User.create(userUtil.generate())
    patient = await user.createDefaultPatient(patientUtil.generate())
    forbiddenPatient = await Patient.create(patientUtil.generate())
    token = cognito.signToken({ email: user.email })
  })

  afterEach(async () => {
    await userUtil.clean()
    await patientUtil.clean()
    nock.cleanAll()
  })

  after(async () => {
    await cleanDB()
    nock.restore()
  })

  describe(`POST ${MEDFUSION_PATH}`, () => {
    beforeEach(() => {
      patientPath = buildPath(patient.id, PROVIDERS.MEDFUSION)
      forbiddenPatientPath = buildPath(forbiddenPatient.id, PROVIDERS.MEDFUSION)
    })

    it(`Should return ${httpStatus.UNAUTHORIZED} if no authenticated`, (done) => {
      request(app)
        .post(patientPath)
        .end((err, { status, body }) => {
          expect(err).to.be.null
          expect(status).to.equal(httpStatus.UNAUTHORIZED)
          expect(body).to.eql({
            statusCode: httpStatus.UNAUTHORIZED,
            name: httpStatus['401_NAME'],
            message: 'Missing authorization header'
          })
          done()
        })
    })

    it(`Should return ${httpStatus.FORBIDDEN} if patient doesnt belongs to user`, (done) => {
      request(app)
        .post(forbiddenPatientPath)
        .set('Authorization', `Bearer ${token}`)
        .end((err, { status, body }) => {
          expect(err).to.be.null
          expect(status).to.equal(httpStatus.FORBIDDEN)
          expect(body).to.eql({
            statusCode: httpStatus.FORBIDDEN,
            name: httpStatus['403_NAME'],
            message: `Patient ${forbiddenPatient.id} not within user ${user.id} patients`
          })
          done()
        })
    })

    it(`Should return ${httpStatus.OK} with user settings`, async () => {
      const customerAccessToken = medfusionUtil.createCustomerAccessToken()
      const userUuid = chance.guid()
      const userAccessToken = medfusionUtil.createUserAccessToken({ userUuid })
      const profileId = chance.integer({ min: 100, max: 2300 })
      /* eslint-disable max-len */
      const createCustomerAccessTokenScope = medfusionUtil.sandbox.tokens.create(customerAccessToken)
      const createUserScope = medfusionUtil.sandbox.users.create(customerAccessToken, userUuid)
      const createUserAccessTokenScope = medfusionUtil.sandbox.users.createAccessToken(customerAccessToken, userUuid, userAccessToken)
      const getUserProfilesScope = medfusionUtil.sandbox.users.profiles(userAccessToken, userUuid, profileId)
      /* eslint-enable max-len */
      const createdAt = new Date()
      const updatedAt = createdAt
      expect(patient.ehrProviders).to.be.undefined
      MockDate.set(createdAt)
      const { status, body } = await request(app)
        .post(patientPath)
        .set('Authorization', `Bearer ${token}`)
      expect(status).to.eql(httpStatus.OK)
      expect(createCustomerAccessTokenScope.isDone()).to.be.true
      expect(createUserScope.isDone()).to.be.true
      expect(createUserAccessTokenScope.isDone()).to.be.true
      expect(getUserProfilesScope.isDone()).to.be.true
      expect(body).to.eql({
        userUuid,
        mainProfileId: profileId.toString(),
        accessToken: userAccessToken,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString()
      })
      const patientAfter = await Patient.findById(patient.id)
      expect(patientAfter).to.have.property('ehrProviders')
        .to.be.an('object')
        .that.has.property('medfusion')
      const medfusionAttrs = patientAfter.ehrProviders.medfusion
      expect(medfusionAttrs.toJSON()).to.eql({
        userUuid,
        mainProfileId: profileId.toString(),
        accessToken: userAccessToken,
        createdAt,
        updatedAt
      })
      MockDate.reset()
    })
  
    it('Should not create medfusion user if user already have one', async () => {
      const customerAccessToken = medfusionUtil.createCustomerAccessToken()
      const userUuid = chance.guid()
      const userAccessToken = medfusionUtil.createUserAccessToken({ userUuid })
      const profileId = chance.integer({ min: 100, max: 2300 })
      /* eslint-disable max-len */
      const createCustomerAccessTokenScope = medfusionUtil.sandbox.tokens.create(customerAccessToken)
      const createUserScope = medfusionUtil.sandbox.users.create(customerAccessToken, userUuid)
      const createUserAccessTokenScope = medfusionUtil.sandbox.users.createAccessToken(customerAccessToken, userUuid, userAccessToken)
      const getUserProfilesScope = medfusionUtil.sandbox.users.profiles(userAccessToken, userUuid, profileId)
      /* eslint-enable max-len */
      const now = new Date()
      MockDate.set(now)
      patient.ehrProviders = {
        medfusion: {
          userUuid,
          mainProfileId: profileId.toString(),
          accessToken: userAccessToken,
          lastSync: now
        }
      }
      await patient.save()
      expect(patient.ehrProviders)
        .to.have.property('medfusion')
      expect(patient.ehrProviders.medfusion.toJSON())
        .to.eql({
          userUuid,
          mainProfileId: profileId.toString(),
          accessToken: userAccessToken,
          createdAt: now,
          updatedAt: now,
          lastSync: now
        })
      const response = await request(app)
        .post(patientPath)
        .set('Authorization', `Bearer ${token}`)
      expect(response.status).to.eql(httpStatus.OK)
      // only access token should be refresshed
      expect(createCustomerAccessTokenScope.isDone()).to.be.true
      expect(createUserAccessTokenScope.isDone()).to.be.true
      expect(createUserScope.isDone()).to.be.false
      expect(getUserProfilesScope.isDone()).to.be.true
      expect(response.body).to.eql({
        userUuid,
        mainProfileId: profileId.toString(),
        accessToken: userAccessToken,
        lastSync: now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      })
      MockDate.reset()
    })
  })
  
  it(`Should return ${httpStatus.BAD_REQUEST} if provider is not recognized`, (done) => {
    const unkownProvider = chance.word()
    request(app)
      .post(buildPath(patient.id, unkownProvider))
      .set('Authorization', `Bearer ${token}`)
      .end((err, { status, body }) => {
        expect(err).to.be.null
        expect(status).to.equal(httpStatus.BAD_REQUEST)
        expect(body).to.eql({
          statusCode: httpStatus.BAD_REQUEST,
          name: httpStatus['400_NAME'],
          message: 'child "provider" fails because ["provider" must be one of [medfusion]]'
        })
        done()
      })
  })
  it(`Should return ${httpStatus.BAD_REQUEST} if patient id is not valid objectId`, (done) => {
    request(app)
      .post(buildPath('InvalidObjectId', PROVIDERS.MEDFUSION))
      .set('Authorization', `Bearer ${token}`)
      .end((err, { status, body }) => {
        expect(err).to.be.null
        expect(status).to.equal(httpStatus.BAD_REQUEST)
        expect(body).to.eql({
          statusCode: httpStatus.BAD_REQUEST,
          name: httpStatus['400_NAME'],
          message: 'child "patientId" fails because ["patientId" with value "InvalidObjectId" fails to match the required pattern: /^[a-f0-9]{24}$/]' // eslint-disable-line max-len
        })
        done()
      })
  })
})
