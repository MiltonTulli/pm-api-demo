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

describe(`PATCH ${PATH}`, () => {
  let User
  let Patient
  let Descriptor
  let user
  let patient
  let condition
  let biomarkers
  let stages
  let forbiddenPatient
  let token
  let patientPath
  let forbiddenPatientPath
  let patientCondition
  let patchData

  const buildPath = (patientId, conditionId) => `/patients/${patientId}/conditions/${conditionId}`

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
    biomarkers = [
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
      })]
    stages = [
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
      ...biomarkers,
      ...stages
    ])
  })

  beforeEach(async () => {
    user = await User.create(userUtil.generate())
    patient = await user.createDefaultPatient(patientUtil.generate())
    forbiddenPatient = await Patient.create(patientUtil.generate())
    token = cognito.signToken({ email: user.email })
    const sampledBiomarkers = chance.pickset(biomarkers, 2)
    const sampledStages = chance.pickset(stages, 2)
    patientCondition = await patient.createConditionSummary(
      conditionSummaryUtil.generate({
        type: condition.id,
        descriptors: _.map([sampledBiomarkers[0], sampledStages[0]], 'id')
      })
    )
    patientPath = buildPath(patient.id, patientCondition.id)
    const patchDescriptors = [sampledBiomarkers[1], sampledStages[1]]
    
    patchData = {
      descriptors: _.map(patchDescriptors, 'id')
    }

    forbiddenPatientPath = buildPath(forbiddenPatient.id, mongoose.Types.ObjectId())
  })

  after(cleanDB)

  it(`Shoud return ${httpStatus.UNAUTHORIZED} if no authenticated`, (done) => {
    request(app)
      .patch(patientPath)
      .send(patchData)
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
      .patch(forbiddenPatientPath)
      .set('Authorization', `Bearer ${token}`)
      .send(patchData)
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
      .patch(patientPath)
      .set('Authorization', `Bearer ${token}`)
      .send(patchData)
      .end((err, { status }) => {
        expect(err).to.be.null
        expect(status).to.equal(httpStatus.OK)
        done()
      })
  })
})
