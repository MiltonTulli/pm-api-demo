'use strict'

const mongoose = require('mongoose')
const httpStatus = require('http-status')
const jwt = require('jsonwebtoken')
const {
  app,
  boot,
  cleanDB,
  expect,
  request,
  chance
} = require('../../index')
const {
  awsUtil,
  userUtil,
  patientUtil,
  conditionSummaryUtil
} = require('../../util')

const PATH = '/me'

describe(`DELETE ${PATH}`, () => {
  let User
  let Condition
  let Patient
  let patient
  let otherPatient
  let otherUserPatient
  let user
  
  before(async () => {
    await boot()
    await cleanDB()
    User = mongoose.model('User')
    Condition = mongoose.model('ConditionSummary')
    Patient = mongoose.model('Patient')
  })

  beforeEach(async () => {
    user = await User.create(userUtil.generate())
    patient = await user.createDefaultPatient(patientUtil.generate())
    await Condition.create(conditionSummaryUtil.generate({ patient: patient._id }))
    otherPatient = await user.createPatient(patientUtil.generate())
    await Condition.create(conditionSummaryUtil.generate({ patient: otherPatient._id }))
    otherUserPatient = await Patient.create(patientUtil.generate())
    await Condition.create(conditionSummaryUtil.generate({ patient: otherUserPatient._id }))
  })

  afterEach(cleanDB)

  after(cleanDB)
  
  it(`Should return ${httpStatus.UNAUTHORIZED} if no authorization in header`, (done) => {
    request(app)
      .delete(PATH)
      .end((err, { status, body }) => {
        expect(err).to.be.null
        expect(status).to.eql(httpStatus.UNAUTHORIZED)
        expect(body).to.eql({
          statusCode: httpStatus.UNAUTHORIZED,
          name: httpStatus['401_NAME'],
          message: 'Missing authorization header'
        })
        done()
      })
  })

  it(`Should return ${httpStatus.UNAUTHORIZED} if token is invalid`, (done) => {
    let invalidToken = awsUtil.cognito.signToken({ email: user.email })
    // we modify this token and sign again with a different secret
    const decoded = jwt.decode(invalidToken)
    invalidToken = jwt.sign({
      ...decoded,
      ...{ email: chance.email() }
    }, chance.guid())
    request(app)
      .delete(PATH)
      .set('Authorization', `Bearer ${invalidToken}`)
      .end((err, { status, body }) => {
        expect(err).to.be.null
        expect(status).to.eql(httpStatus.UNAUTHORIZED)
        expect(body).to.eql({
          statusCode: httpStatus.UNAUTHORIZED,
          name: httpStatus['401_NAME'],
          message: 'Invalid id token'
        })
        done()
      })
  })

  it(`Should return ${httpStatus.NO_CONTENT} and remove user`, async () => {
    const token = awsUtil.cognito.signToken({ email: user.email })
    const conditionsBefore = await Condition.find()
    expect(conditionsBefore)
    const { status } = await request(app)
      .delete(PATH)
      .set('Authorization', `Bearer ${token}`)
    expect(status).to.eql(httpStatus.NO_CONTENT)
    const userAfter = await User.findOne({ email: user.email })
    expect(userAfter.status).to.equal(userUtil.STATUS.REMOVED)
    const conditions = await Condition.find()
    conditions.forEach((condition) => {
      expect(condition.patient.toString()).not.to.equal(patient.id)
      expect(condition.patient.toString()).not.to.equal(otherPatient.id)
    })
    const userPatients = await Patient.find()
    userPatients.forEach((userPatient) => {
      expect(userPatient.user.toString()).not.to.equal(user.id)
    })
  })
})
