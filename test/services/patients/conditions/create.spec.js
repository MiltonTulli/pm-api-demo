'use strict'

const httpStatus = require('http-status')
const MockDate = require('mockdate')
const mongoose = require('mongoose')
const Promise = require('bluebird')
const _ = require('lodash')
const {
  boot,
  cleanDB,
  app,
  request,
  expect,
  chance
} = require('../../../index')
const {
  userUtil,
  patientUtil,
  conditionSummaryUtil,
  descriptorUtil
} = require('../../../util')

const { cognito } = require('../../../util/aws')

const PATH = '/patients/:patientId/conditions'

describe(`POST ${PATH}`, () => {
  let patientPath
  let forbiddenPatientPath
  let conditionSummaryData
  let user
  let patient
  let forbiddenPatient
  let token
  let User
  let Patient
  let Descriptor
  let ConditionSummary
  let condition
  let otherCondition
  let conditionDescriptors
  let otherConditionSummaryData
  let otherConditionDescriptors
  let expectedConditionResponse
  let expectedOtherConditionResponse

  const buildPath = patientId => `/patients/${patientId}/conditions`
  
  /**
   * This helper function is for build an spected response for a given descriptor.
   * Some fields are BSJON or Date but when returned from server this values are string.
   * @param {MongoDoc} descriptor
   */
  const descriptorResponse = descriptor => _.assign({}, descriptor.toJSON(), {
    id: descriptor.id,
    parents: _.map(descriptor.parents, _.toString),
    createdAt: descriptor.createdAt.toISOString(),
    updatedAt: descriptor.updatedAt.toISOString()
  })

  before(async () => {
    await boot()
    await cleanDB()
    User = mongoose.model('User')
    Patient = mongoose.model('Patient')
    Descriptor = mongoose.model('Descriptor')
    ConditionSummary = mongoose.model('ConditionSummary')

    await Promise.all([
      User.ensureIndexes(),
      Patient.ensureIndexes(),
      Descriptor.ensureIndexes(),
      ConditionSummary.ensureIndexes()
    ])
    // create base descriptor with other props
    condition = new Descriptor(descriptorUtil.generate({ type: 'condition', name: 'lung_cancer' }))
    otherCondition = new Descriptor(descriptorUtil.generate({ type: 'condition', name: 'breast_cancer' })) // eslint-disable-line max-len
    conditionDescriptors = [
      new Descriptor({
        type: 'biomarker',
        label: 'EGFR',
        name: 'biomarker1',
        parents: [condition.id]
      }),
      new Descriptor({
        type: 'biomarker',
        label: 'RAS',
        name: 'biomarker2',
        parents: [condition.id]
      }),
      new Descriptor({
        type: 'biomarker',
        label: 'KRAS',
        name: 'biomarker3',
        parents: [condition.id]
      }),
      new Descriptor({
        type: 'stage',
        label: 'Stage 1',
        name: 'stage1',
        parents: [condition.id]
      }),
      new Descriptor({
        type: 'stage',
        label: 'Stage 2',
        name: 'stage2',
        parents: [condition.id]
      }),
      new Descriptor({
        type: 'stage',
        label: 'Stage 3',
        name: 'stage3',
        parents: [condition.id]
      })
    ]
    otherConditionDescriptors = [
      new Descriptor({
        type: 'biomarker',
        label: 'EGFR',
        name: 'biomarker11',
        parents: [otherCondition.id]
      }),
      new Descriptor({
        type: 'biomarker',
        label: 'RAS',
        name: 'biomarker22',
        parents: [otherCondition.id]
      })
    ]
    await Descriptor.insertMany([
      condition,
      otherCondition,
      ...conditionDescriptors,
      ...otherConditionDescriptors
    ])
  })

  beforeEach(async () => {
    user = await User.create(userUtil.generate())
    patient = await user.createDefaultPatient(patientUtil.generate())
    forbiddenPatient = await Patient.create(patientUtil.generate())
    token = cognito.signToken({ email: user.email })
    patientPath = buildPath(patient.id)
    forbiddenPatientPath = buildPath(forbiddenPatient.id)
    let descriptorsSample = chance.pickset(conditionDescriptors, 2)

    conditionSummaryData = _.omit(conditionSummaryUtil.generate(
      {
        type: condition.id, descriptors: _.map(descriptorsSample, 'id')
      }
    ), 'patient')

    expectedConditionResponse = _.assign({}, conditionSummaryData, {
      onsetDateTime: conditionSummaryData.onsetDateTime.toISOString(),
      patient: patient.id,
      type: descriptorResponse(condition),
      descriptors: _.map(descriptorsSample, descriptorResponse)
    })

    descriptorsSample = chance.pickset(otherConditionDescriptors, 2)
    otherConditionSummaryData = _.omit(conditionSummaryUtil.generate(
      {
        type: otherCondition.id, descriptors: _.map(descriptorsSample, 'id')
      }
    ), 'patient')

    expectedOtherConditionResponse = _.assign({}, otherConditionSummaryData, {
      onsetDateTime: otherConditionSummaryData.onsetDateTime.toISOString(),
      patient: patient.id,
      type: descriptorResponse(otherCondition),
      descriptors: _.map(descriptorsSample, descriptorResponse)
    })
  })

  afterEach(async () => {
    // await conditionSummaryUtil.clean()
    await patientUtil.clean()
    await userUtil.clean()
  })

  // after(cleanDB)

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
      .send(conditionSummaryData)
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

  it(`Should return ${httpStatus.BAD_REQUEST} with wrong descriptors`, (done) => {
    Object.assign(conditionSummaryData, { descriptors: _.map(otherConditionDescriptors, 'id') })
    request(app)
      .post(patientPath)
      .set('Authorization', `Bearer ${token}`)
      .send(conditionSummaryData)
      .end((err, { status, body }) => {
        expect(err).to.be.null
        expect(status).to.equal(httpStatus.BAD_REQUEST)
        expect(body).to.eql({
          statusCode: httpStatus.BAD_REQUEST,
          name: httpStatus['400_NAME'],
          message: 'Invalid Descriptors'
        })
        done()
      })
  })

  it(`Should return ${httpStatus.CONFLICT} if patient already has condition`, async () => {
    const createdAt = new Date()
    const updatedAt = createdAt
    MockDate.set(createdAt)
    const createResponse = await request(app)
      .post(patientPath)
      .set('Authorization', `Bearer ${token}`)
      .send(conditionSummaryData)
    expect(createResponse.status).to.eql(httpStatus.OK)
    expect(createResponse.body).to.deep.eql(_.assign(
      {},
      expectedConditionResponse,
      { id: createResponse.body.id, createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString() } // eslint-disable-line max-len
    ))
    MockDate.reset()
    const rejectedResponse = await request(app)
      .post(patientPath)
      .set('Authorization', `Bearer ${token}`)
      .send(conditionSummaryData)
    expect(rejectedResponse.status).to.eql(httpStatus.CONFLICT)
  })

  it(`Should return ${httpStatus.OK} if patient doesnt have condition`, async () => {
    const createdAt = new Date()
    const updatedAt = createdAt
    MockDate.set(createdAt)
    const firstConditionResponse = await request(app)
      .post(patientPath)
      .set('Authorization', `Bearer ${token}`)
      .send(conditionSummaryData)
    expect(firstConditionResponse.status).to.eql(httpStatus.OK)
    expect(firstConditionResponse.body).to.deep.eql(_.assign(
      {},
      expectedConditionResponse,
      { id: firstConditionResponse.body.id, createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString() } // eslint-disable-line max-len
    ))
    const secondConditionResponse = await request(app)
      .post(patientPath)
      .set('Authorization', `Bearer ${token}`)
      .send(otherConditionSummaryData)
    expect(secondConditionResponse.status).to.eql(httpStatus.OK)
    expect(secondConditionResponse.body).to.deep.eql(_.assign(
      {},
      expectedOtherConditionResponse,
      { id: secondConditionResponse.body.id, createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString() } // eslint-disable-line max-len
    ))
    MockDate.reset()
  })

  it(`Should return ${httpStatus.OK} with new condition summary`, async () => {
    const createdAt = new Date()
    const updatedAt = createdAt
    MockDate.set(createdAt)
    const { status, body } = await request(app)
      .post(patientPath)
      .set('Authorization', `Bearer ${token}`)
      .send(conditionSummaryData)
    expect(status).to.eql(httpStatus.OK)
    expect(body).to.deep.equal(
      _.assign(
        {},
        expectedConditionResponse,
        { id: body.id, createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString() }
      )
    )
    MockDate.reset()
  })
})
