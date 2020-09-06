'use strict'

const mongoose = require('mongoose')
const httpStatus = require('http-status')
const _ = require('lodash')
const {
  app,
  boot,
  cleanDB,
  expect,
  chance,
  request
} = require('../../../index')

const {
  userUtil,
  patientUtil,
  conditionSummaryUtil,
  descriptorUtil
} = require('../../../util')

const { cognito } = require('../../../util/aws')

const PATH = '/patients/:patientId/conditions/:conditionId'

describe(`GET ${PATH}`, () => {
  let User
  let Patient
  let Descriptor
  let user
  let patient
  let condition
  let conditionDescriptors
  let forbiddenPatient
  let token
  let patientPath
  let forbiddenPatientPath
  let patientCondition
  let expectedPatientCondition

  const buildPath = (patientId, conditionId) => `/patients/${patientId}/conditions/${conditionId}`

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
    await Promise.all([
      User.ensureIndexes(),
      Patient.ensureIndexes(),
      Descriptor.ensureIndexes()
    ])
    // create base descriptor with other props
    condition = new Descriptor(descriptorUtil.generate({ type: 'condition', name: 'lung_cancer' }))
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
    await Descriptor.insertMany([
      condition,
      ...conditionDescriptors
    ])
  })

  beforeEach(async () => {
    user = await User.create(userUtil.generate())
    patient = await user.createDefaultPatient(patientUtil.generate())
    forbiddenPatient = await Patient.create(patientUtil.generate())
    token = cognito.signToken({ email: user.email })
    const descriptorsSample = chance.pickset(conditionDescriptors, 2)

    patientCondition = await patient.createConditionSummary(
      conditionSummaryUtil.generate({
        type: condition.id,
        descriptors: _.map(descriptorsSample, 'id')
      })
    )
    patientPath = buildPath(patient.id, patientCondition.id)
    
    expectedPatientCondition = _.assign({}, patientCondition.toJSON(), {
      id: patientCondition.id,
      createdAt: patientCondition.createdAt.toISOString(),
      updatedAt: patientCondition.updatedAt.toISOString(),
      onsetDateTime: patientCondition.onsetDateTime.toISOString(),
      patient: patient.id,
      type: descriptorResponse(condition),
      descriptors: _.map(descriptorsSample, descriptorResponse)
    })

    forbiddenPatientPath = buildPath(forbiddenPatient.id, mongoose.Types.ObjectId())
  })

  after(cleanDB)

  it(`Shoud return ${httpStatus.UNAUTHORIZED} if no authenticated`, (done) => {
    request(app)
      .get(patientPath)
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

  // TODO: FIX THIS TEST, need to test agains verified patient
  it.skip(`Should return ${httpStatus.FORBIDDEN} if patient doesnt belongs to user`, (done) => {
    request(app)
      .get(forbiddenPatientPath)
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

  it(`Should return ${httpStatus.OK} with condition summary`, (done) => {
    request(app)
      .get(patientPath)
      .set('Authorization', `Bearer ${token}`)
      .end((err, { status, body }) => {
        expect(err).to.be.null
        expect(status).to.equal(httpStatus.OK)
        expect(body).to.deep.eql(expectedPatientCondition)
        done()
      })
  })
})
