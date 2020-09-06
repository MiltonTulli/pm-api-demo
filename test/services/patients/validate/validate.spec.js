'use strict'

const httpStatus = require('http-status')
const mongoose = require('mongoose')
const nock = require('nock')
const _ = require('lodash')
const {
  boot,
  cleanDB,
  app,
  request,
  expect
} = require('../../../index')
const { userUtil, patientUtil, growsurfUtil } = require('../../../util')
const { cognito } = require('../../../util/aws')
const { ACCOUNT_TYPE } = require('../../../../src/models/User/User.constants')

const PATH = '/patients/:patientId/validate'

describe(`POST ${PATH}`, () => {
  let patientPath
  let forbiddenPatientPath
  let user
  let patient
  let forbiddenPatient
  let token
  let User
  let Patient
  let growsurfScope

  const buildPath = patientId => `/patients/${patientId}/validate`

  before(async () => {
    await boot()
    await cleanDB()
    if (!nock.isActive()) nock.activate()
    nock.disableNetConnect()
    nock.enableNetConnect('127.0.0.1')
    nock.cleanAll()
    User = mongoose.model('User')
    Patient = mongoose.model('Patient')
  })

  beforeEach(async () => {
    user = await User.create(userUtil.generate())
    patient = await user.createDefaultPatient(patientUtil.generate())
    forbiddenPatient = await Patient.create(patientUtil.generate())
    token = cognito.signToken({ email: user.email })
    patientPath = buildPath(patient.id)
    forbiddenPatientPath = buildPath(forbiddenPatient.id)
    growsurfScope = growsurfUtil.addParticipant({
      body:
      {
        email: user.email,
        referredBy: _.get(patient, 'referral.growSurfId', ''),
        referralStatus: 'CREDIT_AWARDED'
      }
    }, growsurfUtil.mockSuccessResponse({ email: user.email }))
  })

  afterEach(async () => {
    await patientUtil.clean()
    await userUtil.clean()
    nock.cleanAll()
  })

  after(async () => {
    await cleanDB()
    nock.restore()
  })

  it(`Shoud return ${httpStatus.UNAUTHORIZED} if no authenticated`, (done) => {
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

  describe('with unverified Patient', () => {
    it(`Should return ${httpStatus.OK} and validate patient`, async () => {
      expect(patient.isValidated).to.be.false
      expect(patient.isVerified).to.be.false
      expect(user.accountType).to.equal(ACCOUNT_TYPE.GUEST)

      const { status } = await request(app)
        .post(patientPath)
        .set('Authorization', `Bearer ${token}`)
      expect(status).to.equal(httpStatus.OK)
      
      const patientAfter = await mongoose.model('Patient').findById(patient.id)
      const userAfter = await mongoose.model('User').findById(patient.user)

      expect(patientAfter.isValidated).to.be.true
      expect(patientAfter.isVerified).to.be.false
      expect(userAfter.accountType).to.equal(ACCOUNT_TYPE.GUEST)
    })
  })

  describe('with verified Patient', () => {
    beforeEach(async () => {
      await patient.setAsVerified()
    })

    it(`Should return ${httpStatus.OK} and validate patient and promote user`, async () => {
      expect(growsurfScope.isDone()).to.be.true
      expect(patient.isValidated).to.be.false
      expect(patient.isVerified).to.be.true
      expect(user.accountType).to.equal(ACCOUNT_TYPE.GUEST)
  
      const { status } = await request(app)
        .post(patientPath)
        .set('Authorization', `Bearer ${token}`)
      expect(status).to.equal(httpStatus.OK)
      
      const patientAfter = await mongoose.model('Patient').findById(patient.id)
      const userAfter = await mongoose.model('User').findById(patient.user)
  
      expect(patientAfter.isValidated).to.be.true
      expect(patientAfter.isVerified).to.be.true
      expect(userAfter.accountType).to.equal(ACCOUNT_TYPE.PARTNER)
    })
  })
})
