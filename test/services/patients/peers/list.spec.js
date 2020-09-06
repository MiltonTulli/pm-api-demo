'use strict'

const Promise = require('bluebird')
const mongoose = require('mongoose')
const httpStatus = require('http-status')
const {
  app,
  boot,
  cleanDB,
  expect,
  chance,
  request
} = require('../../../index')
const { PAGINATION_DEFAULT_LIMIT } = require('../../../../src/services/patients/peers/constants')
const {
  userUtil,
  patientUtil
} = require('../../../util')

const { cognito } = require('../../../util/aws')

const PATH = '/patients/:patientId/peers'

const TOTAL_UNVERIFED_PATIENTS = 5
const TOTAL_VERIFIED_PATIENTS = 5


describe(`GET ${PATH}`, () => {
  let User
  let Patient
  let user
  let patient
  let token
  let path

  const createPatients = (n, attrs) => Promise.map(
    chance.n(() => patientUtil.generate(attrs), n), p => Patient.create(p)
  )

  before(async () => {
    await boot()
    await cleanDB()
    User = mongoose.model('User')
    Patient = mongoose.model('Patient')
    await Promise.all([
      User.ensureIndexes(),
      Patient.ensureIndexes()
    ])
  })

  beforeEach(async () => {
    user = await User.create(userUtil.generate())
    patient = await user.createDefaultPatient(patientUtil.generate({ isVerified: true }))
    await createPatients(TOTAL_VERIFIED_PATIENTS, { isVerified: true })
    await createPatients(TOTAL_UNVERIFED_PATIENTS, { isVerified: false })
    token = cognito.signToken({ email: user.email })
    path = `/patients/${patient.id}/peers`
  })

  afterEach(patientUtil.clean)
  after(cleanDB)

  it(`Shoud return ${httpStatus.UNAUTHORIZED} if no authenticated`, (done) => {
    request(app)
      .get(path)
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

  it(`Should return ${httpStatus.BAD_REQUEST} when offset is less than 0`, (done) => {
    const invalidQuery = { offset: chance.integer({ max: -1 }) }
    request(app)
      .get(path)
      .set('Authorization', `Bearer ${token}`)
      .query(invalidQuery)
      .end((err, { status, body }) => {
        expect(err).to.be.null
        expect(status).to.equal(httpStatus.BAD_REQUEST)
        expect(body).to.eql({
          statusCode: httpStatus.BAD_REQUEST,
          name: httpStatus['400_NAME'],
          message: 'child "offset" fails because ["offset" must be larger than or equal to 0]'
        })
        done()
      })
  })

  // eslint-disable-next-line max-len
  it(`Should return default limit=${PAGINATION_DEFAULT_LIMIT} when dont receive unrequired LIMIT query param, with status ${httpStatus.OK}`, (done) => {
    request(app)
      .get(path)
      .set('Authorization', `Bearer ${token}`)
      .end((err, { status, body }) => {
        expect(err).to.be.null
        expect(status).to.equal(httpStatus.OK)
        expect(body.limit).to.equal(PAGINATION_DEFAULT_LIMIT)
        done()
      })
  })

  it(`Should return ${httpStatus.OK} on request with offset, limit & patientId`, (done) => {
    const offset = 1
    const limit = 2
    request(app)
      .get(path)
      .set('Authorization', `Bearer ${token}`)
      .query({ offset, limit })
      .end((err, { status, body }) => {
        expect(err).to.be.null
        expect(status).to.equal(httpStatus.OK)
        expect(body.limit).to.equal(limit)
        expect(body.offset).to.equal(offset)
        expect(body.total).to.be.equal(TOTAL_VERIFIED_PATIENTS)
        done()
      })
  })

  describe('Get peers with startAfter param', () => {
    const NEW_PATIENTS = 10
    let patientToStartAfter
    let newPatients

    beforeEach(async () => {
      patientToStartAfter = await Patient.create(patientUtil.generate())
      newPatients = await createPatients(NEW_PATIENTS, { isVerified: true })
    })
    
    it('Should return next patients list when receibe [ startafter ] query param', (done) => {
      request(app)
        .get(path)
        .set('Authorization', `Bearer ${token}`)
        .query({ startAfter: patientToStartAfter.id })
        .end((err, { status, body }) => {
          expect(err).to.be.null
          expect(status).to.equal(httpStatus.OK)
          expect(body.total).to.be.equal(NEW_PATIENTS)
          const resultPeersIds = body.docs.map(p => p.id)
          // patientToStartAfter should not be returned
          expect(resultPeersIds.includes(patientToStartAfter.id)).to.be.false
          // eslint-disable-next-line no-restricted-syntax
          for (const peer of newPatients.slice(0, PAGINATION_DEFAULT_LIMIT)) {
            const peerId = peer._id.toString()
            expect(resultPeersIds.includes(peerId)).to.be.true
          }
          done()
        })
    })
  })
})
