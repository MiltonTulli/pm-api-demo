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
const patientConstants = require('../../../src/models/Patient/Patient.constants')
const referralConstants = require('../../../src/models/Patient/schemas/Referral.constants')

const PATH = '/patients'

describe(`PATCH ${PATH}`, () => {
  let Patient
  let User
  const INVALID_EMAIL = 'INVALID_EMAIL'
  const invalidToken = awsUtil.cognito.signToken({ email: INVALID_EMAIL })
  let user
  let userPatient
  let userToken
  let patientData
  let invalidPatientData
  let invalidProp
  let userPatientPath

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
    'portals',
    'referral'
  ]

  const INVALID_PATIENT_PROPS = _.without(PATIENT_PROPS, ...[
    'names',
    'gender',
    'birthDate',
    'referral'
  ])

  const buildPath = patientId => `${PATH}/${patientId}`

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
    const userPatientData = patientUtil.generate()
    userPatient = await user.createDefaultPatient(userPatientData)
    userPatient.ehrProviders = {
      medfusion: patientUtil.generateMedfusionCredentials()
    }
    await userPatient.save()
    userToken = awsUtil.cognito.signToken({ email: user.email })
    patientData = _.pick(patientUtil.generate(), ['gender', 'birthDate', 'names'])
    invalidProp = chance.pickone(INVALID_PATIENT_PROPS)
    invalidPatientData = _.assign({}, patientData, { [invalidProp]: chance.name() })
    userPatientPath = buildPath(userPatient.id)
  })

  afterEach(async () => {
    await userUtil.clean()
    await patientUtil.clean()
    MockDate.reset()
  })

  after(cleanDB)

  it(`Should return ${httpStatus.UNAUTHORIZED} with no authorization`, (done) => {
    request(app)
      .patch(userPatientPath)
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
      .patch(userPatientPath)
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

  it(`Should return ${httpStatus.BAD_REQUEST} if an invalid prop is sended`, (done) => {
    request(app)
      .patch(userPatientPath)
      .set('Authorization', `Bearer ${userToken}`)
      .send(invalidPatientData)
      .end((err, { status, body }) => {
        expect(err).to.be.null
        expect(status).to.equal(httpStatus.BAD_REQUEST)
        expect(body).to.eql({
          statusCode: httpStatus.BAD_REQUEST,
          name: httpStatus['400_NAME'],
          message: `"${invalidProp}" is not allowed`
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
      .patch(userPatientPath)
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
      .patch(userPatientPath)
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
      .patch(userPatientPath)
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
      .patch(userPatientPath)
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

  it(`Should return ${httpStatus.NO_CONTENT} with valid params`, async () => {
    const mockedDate = new Date()
    MockDate.set(mockedDate)
    const { status } = await request(app)
      .patch(userPatientPath)
      .set('Authorization', `Bearer ${userToken}`)
      .send(patientData)
    MockDate.reset()
    expect(status).to.equal(httpStatus.NO_CONTENT)
    const patientAfter = await Patient.findById(userPatient.id)
    const expectedPatient = {
      ...userPatient.toJSON(),
      ...patientData,
      ...{
        updatedAt: mockedDate
      }
    }
    expect(patientAfter.toJSON()).to.deep.equal(expectedPatient)
  })

  // eslint-disable-next-line max-len
  it(`Should return ${httpStatus.CONFLICT} with no patient changes if patient is verified & provide new patient.referral`, async () => {
    userPatient.isValidated = true
    await userPatient.save()
    const data = _.assign({}, patientData, { referral: { name: chance.name() } })
    const { status, body } = await request(app)
      .patch(userPatientPath)
      .set('Authorization', `Bearer ${userToken}`)
      .send(data)
    expect(body.message).to.be.equal('Can not update patient referal')
    expect(status).to.equal(httpStatus.CONFLICT)
    const patientAfter = await Patient.findById(userPatient.id)
    expect(patientAfter.toJSON()).to.deep.equal(userPatient.toJSON())
  })

  // eslint-disable-next-line max-len
  it(`Should return ${httpStatus.NO_CONTENT} and update patient data if patient is verified & provide non patient.referral`, async () => {
    userPatient.isValidated = true
    userPatient.gender = patientConstants.GENDER.MALE
    await userPatient.save()
    const data = _.assign({}, patientData, { gender: patientConstants.GENDER.FEMALE })
    const { status } = await request(app)
      .patch(userPatientPath)
      .set('Authorization', `Bearer ${userToken}`)
      .send(data)
    expect(status).to.equal(httpStatus.NO_CONTENT)
    const patientAfter = await Patient.findById(userPatient.id)
    expect(patientAfter.toJSON().gender).to.be.equal(data.gender)
  })

  // eslint-disable-next-line max-len
  it(`Should return ${httpStatus.NO_CONTENT} and update patient data if patient is not verified & provide valid patient.referral`, async () => {
    userPatient.isValidated = false
    await userPatient.save()
    const data = _.assign({}, patientData, { referral: patientUtil.generateReferral() })
    const { status } = await request(app)
      .patch(userPatientPath)
      .set('Authorization', `Bearer ${userToken}`)
      .send(data)
    expect(status).to.equal(httpStatus.NO_CONTENT)
    const patientAfter = await Patient.findById(userPatient.id)
    const expectedPatient = { ...userPatient.toJSON(), ...data }
    expect(
      _.omit(patientAfter.toJSON(), ['updatedAt'])
    ).to.deep.equal(_.omit(expectedPatient, ['updatedAt']))
    expect(patientAfter.toJSON().updatedAt === expectedPatient.updatedAt).to.be.false
  })
  
  it('Should not allow to patch unvalidated patient with invalid referral.email', async () => {
    const invalidEmail = 'INVALID_EMAIL.CO' // eslint-disable-next-line max-len
    const expectedErrorMsg = 'child "referral" fails because [child "email" fails because ["email" must be a valid email]]'
    const referral = patientUtil.generateReferral({ email: invalidEmail })
    const data = _.assign({}, patientData, { referral })
    const { status, body } = await request(app)
      .patch(userPatientPath)
      .set('Authorization', `Bearer ${userToken}`)
      .send(data)
    expect(body.message).to.be.equal(expectedErrorMsg)
    expect(status).to.equal(httpStatus.BAD_REQUEST)
    const patientAfter = await Patient.findById(userPatient.id)
    expect(patientAfter.toJSON()).to.deep.equal(userPatient.toJSON())
  })


  // eslint-disable-next-line max-len
  it(`Should not allow to patch unvalidated patient with referral.name shorter than ${referralConstants.NAME_MINLENGTH}`, async () => {
    // eslint-disable-next-line max-len
    const expectedErrorMsg = 'child "referral" fails because [child "name" fails because ["name" length must be at least 3 characters long]]'
    const INVALID_NAME = chance.string({ length: referralConstants.NAME_MINLENGTH - 1 })
    const referral = patientUtil.generateReferral({ name: INVALID_NAME })
    const data = _.assign({}, patientData, { referral })
    const { status, body } = await request(app)
      .patch(userPatientPath)
      .set('Authorization', `Bearer ${userToken}`)
      .send(data)
    expect(body.message).to.be.equal(expectedErrorMsg)
    expect(status).to.equal(httpStatus.BAD_REQUEST)
    const patientAfter = await Patient.findById(userPatient.id)
    expect(patientAfter.toJSON()).to.deep.equal(userPatient.toJSON())
  })

  // eslint-disable-next-line max-len
  it(`Should not allow to patch unvalidated patient with referral.name larger than ${referralConstants.NAME_MAXLENGTH}`, async () => {
    // eslint-disable-next-line max-len
    const expectedErrorMsg = 'child "referral" fails because [child "name" fails because ["name" length must be less than or equal to 100 characters long]]'
    const INVALID_NAME = chance.string({ length: referralConstants.NAME_MAXLENGTH + 1 })
    const referral = patientUtil.generateReferral({ name: INVALID_NAME })
    const data = _.assign({}, patientData, { referral })
    const { status, body } = await request(app)
      .patch(userPatientPath)
      .set('Authorization', `Bearer ${userToken}`)
      .send(data)
    expect(body.message).to.be.equal(expectedErrorMsg)
    expect(status).to.equal(httpStatus.BAD_REQUEST)
    const patientAfter = await Patient.findById(userPatient.id)
    expect(patientAfter.toJSON()).to.deep.equal(userPatient.toJSON())
  })

  it('Should not allow to patch unvalidated patient with referral.date before now', async () => {
    const invalidDate = moment().subtract(referralConstants.ALLOWABLE_MINUTE_DATE_RANGE + 1, 'm')
    const referral = patientUtil.generateReferral({ date: invalidDate })
    const data = _.assign({}, patientData, { referral })
    const { status, body } = await request(app)
      .patch(userPatientPath)
      .set('Authorization', `Bearer ${userToken}`)
      .send(data)
    expect(status).to.equal(httpStatus.BAD_REQUEST)
    expect(body.name).to.equal(httpStatus['400_NAME']) // eslint-disable-next-line max-len
    expect(body.message.replace(/\d{2}:\d{2}:\d{2} /g, '')).to.be.equal(`child "referral" fails because [child "date" fails because ["date" must be larger than or equal to "${moment().format('ddd MMM DD Y')} GMT+0000 (UTC)"]]`)
  })
})
