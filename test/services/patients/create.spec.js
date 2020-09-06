'use strict'

const mongoose = require('mongoose')
const moment = require('moment')
const httpStatus = require('http-status')
const MockDate = require('mockdate')
const _ = require('lodash')
const {
  boot,
  cleanDB,
  app,
  expect,
  request,
  chance
} = require('../../index')

const { userUtil, patientUtil, awsUtil } = require('../../util')

const PATH = '/patients'

describe(`POST ${PATH}`, () => {
  let Patient
  let User
  const INVALID_EMAIL = 'INVALID_EMAIL'
  const invalidToken = awsUtil.cognito.signToken({ email: INVALID_EMAIL })
  let user
  let userToken
  let patientData
  const PATIENT_PROPS = [
    'id',
    'user',
    'names',
    'gender',
    'smokingStatus',
    'birthDate',
    'addresses',
    'createdAt',
    'updatedAt',
    'isVerified',
    'isValidated',
    'hasPortalConnection',
    'sharingOptions',
    'portals'
  ]

  before(async () => {
    await boot()
    await cleanDB()
    Patient = mongoose.model('Patient')
    User = mongoose.model('User')
    await User.ensureIndexes()
    await Patient.ensureIndexes()
  })
  
  beforeEach(async () => {
    user = await User.create(userUtil.generate())
    userToken = awsUtil.cognito.signToken({ email: user.email })
    patientData = _.pick(patientUtil.generate(), ['gender', 'birthDate', 'names'])
  })

  afterEach(async () => {
    await userUtil.clean()
    await patientUtil.clean()
    MockDate.reset()
  })

  after(cleanDB)

  it(`Should return ${httpStatus.UNAUTHORIZED} with no authorization`, (done) => {
    request(app)
      .post(PATH)
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

  it(`Should return ${httpStatus.UNAUTHORIZED} with invalid authorization`, (done) => {
    request(app)
      .post(PATH)
      .set('Authorization', `Bearer ${invalidToken}`)
      .end((err, { status, body }) => {
        expect(err).to.be.null
        expect(status).to.equal(httpStatus.UNAUTHORIZED)
        expect(body).to.eql({
          statusCode: httpStatus.UNAUTHORIZED,
          name: httpStatus['401_NAME'],
          message: `User with email ${INVALID_EMAIL} not found`
        })
        done()
      })
  })

  it(`Should return ${httpStatus.BAD_REQUEST} if omit a required property`, (done) => {
    const omittedProperty = chance.pickone(Object.keys(patientData))
    const invalidPatientData = _.omit(patientData, omittedProperty)
    request(app)
      .post(PATH)
      .set('Authorization', `Bearer ${userToken}`)
      .send(invalidPatientData)
      .end((err, { status, body }) => {
        expect(err).to.be.null
        expect(status).to.equal(httpStatus.BAD_REQUEST)
        expect(body).to.eql({
          statusCode: httpStatus.BAD_REQUEST,
          name: httpStatus['400_NAME'],
          message: `child "${omittedProperty}" fails because ["${omittedProperty}" is required]`
        })
        done()
      })
  })

  it(`Should return ${httpStatus.BAD_REQUEST} if unknown property is send`, (done) => {
    const invalidProperty = chance.guid()
    Object.assign(patientData, { [invalidProperty]: chance.word() })
    request(app)
      .post(PATH)
      .set('Authorization', `Bearer ${userToken}`)
      .send(patientData)
      .end((err, { status, body }) => {
        expect(err).to.be.null
        expect(status).to.equal(httpStatus.BAD_REQUEST)
        expect(body).to.eql({
          statusCode: httpStatus.BAD_REQUEST,
          name: httpStatus['400_NAME'],
          message: `"${invalidProperty}" is not allowed`
        })
        done()
      })
  })

  it(`Should return ${httpStatus.BAD_REQUEST} if birthdate is a future date`, (done) => {
    const nowDate = new Date()
    const futureDate = moment(nowDate).add(1, 'h')
    MockDate.set(nowDate)
    Object.assign(patientData, { birthDate: futureDate })
    request(app)
      .post(PATH)
      .set('Authorization', `Bearer ${userToken}`)
      .send(patientData)
      .end((err, { status, body }) => {
        expect(err).to.be.null
        expect(status).to.equal(httpStatus.BAD_REQUEST)
        expect(body).to.eql({
          statusCode: httpStatus.BAD_REQUEST,
          name: httpStatus['400_NAME'],
          message: `child "birthDate" fails because ["birthDate" must be less than "${nowDate.toString()}"]` // eslint-disable-line max-len
        })
        done()
      })
  })

  it(`Should return ${httpStatus.BAD_REQUEST} if birthdate is before 1-1-1900`, (done) => {
    const invalidDate = moment('1900-1-1', 'YYYY-MM-DD').subtract(1, 'h')
    Object.assign(patientData, { birthDate: invalidDate })
    request(app)
      .post(PATH)
      .set('Authorization', `Bearer ${userToken}`)
      .send(patientData)
      .end((err, { status, body }) => {
        expect(err).to.be.null
        expect(status).to.equal(httpStatus.BAD_REQUEST)
        expect(body).to.eql({
          statusCode: httpStatus.BAD_REQUEST,
          name: httpStatus['400_NAME'],
          message: 'child "birthDate" fails because ["birthDate" must be larger than or equal to "Mon Jan 01 1900 00:00:00 GMT+0000 (UTC)"]' // eslint-disable-line max-len
        })
        done()
      })
  })

  it(`Should return ${httpStatus.BAD_REQUEST} if gender is invalid`, (done) => {
    Object.assign(patientData, { gender: 'not_valid_gender' })
    request(app)
      .post(PATH)
      .set('Authorization', `Bearer ${userToken}`)
      .send(patientData)
      .end((err, { status, body }) => {
        expect(err).to.be.null
        expect(status).to.equal(httpStatus.BAD_REQUEST)
        expect(body).to.eql({
          statusCode: httpStatus.BAD_REQUEST,
          name: httpStatus['400_NAME'],
          message: 'child "gender" fails because ["gender" must be one of [male, female, other, unknown]]' // eslint-disable-line max-len
        })
        done()
      })
  })

  it(`Should return ${httpStatus.BAD_REQUEST} if name is empty`, (done) => {
    Object.assign(patientData, { names: [] })
    request(app)
      .post(PATH)
      .set('Authorization', `Bearer ${userToken}`)
      .send(patientData)
      .end((err, { status, body }) => {
        expect(err).to.be.null
        expect(status).to.equal(httpStatus.BAD_REQUEST)
        expect(body).to.eql({
          statusCode: httpStatus.BAD_REQUEST,
          name: httpStatus['400_NAME'],
          message: 'child "names" fails because ["names" must contain at least 1 items]' // eslint-disable-line max-len
        })
        done()
      })
  })

  it(`Should return ${httpStatus.OK} with valid params`, async () => {
    const mockedDate = new Date()
    MockDate.set(mockedDate)
    const { body, status } = await request(app)
      .post(PATH)
      .set('Authorization', `Bearer ${userToken}`)
      .send(patientData)
    MockDate.reset()
    expect(status).to.equal(httpStatus.OK)
    expect(body).to.be.an('object')
      .that.has.all.keys(PATIENT_PROPS)
    const userAfter = await User.findById(user.id)
    expect(userAfter.patients).to.be.an('array').that.has.lengthOf(user.patients.length + 1)
    expect(_.last(userAfter.patients).toString()).to.equal(body.id)
    const expectedPatient = {
      ...patientData,
      ...{
        id: body.id,
        user: user.id,
        addresses: [],
        portals: [],
        birthDate: patientData.birthDate.toISOString(),
        smokingStatus: patientUtil.SMOKING_STATUS.UNKNOWN,
        createdAt: mockedDate.toISOString(),
        updatedAt: mockedDate.toISOString(),
        isVerified: false,
        isValidated: false,
        hasPortalConnection: false,
        sharingOptions: {
          connect: false,
          shareInAggregate: false,
          shareIndividually: false
        }
      }
    }
    expect(body).to.deep.equal(expectedPatient)
  })
})
