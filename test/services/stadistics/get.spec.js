'use strict'

const Promise = require('bluebird')
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
} = require('../../index')

const {
  patientUtil,
  conditionSummaryUtil,
  descriptorUtil
} = require('../../util')

const PATH = '/statistics'
const VERIFIED_PATIENTS_COUNT = 3
const UNVERIFIED_PATIENTS_COUNT = 3

describe(`GET ${PATH}`, () => {
  let User
  let Patient
  let Descriptor
  let lungCancerCondition
  let prostateCancerCondition
  let expectedLungCancerCount
  let expectedProstateCancerCount
  let verifiedPatients
  let unverifiedPatients
  let verifiedConditions

  before(async () => {
    await boot()
    await cleanDB()
    User = mongoose.model('User')
    Patient = mongoose.model('Patient')
    Descriptor = mongoose.model('Descriptor')
    // create view
    await mongoose.connection.createCollection('ExpandedConditionView', {
      viewOn: 'ConditionSummary',
      pipeline: [
        {
          $lookup: {
            from: 'Patient',
            localField: 'patient',
            foreignField: '_id',
            as: 'patient'
          }
        }
      ]
    })
    await Promise.all([
      User.ensureIndexes(),
      Patient.ensureIndexes(),
      Descriptor.ensureIndexes()
    ]);
    // create base descriptor with other props
    ([lungCancerCondition, prostateCancerCondition] = await Promise.map(
      [{ type: 'condition', name: 'lung_cancer' }, { type: 'condition', name: 'prostate_cancer' }],
      condition => Descriptor.create(descriptorUtil.generate(condition))
    ))
  })

  beforeEach(async () => {
    const randomConditionId = () => chance.pickone([lungCancerCondition])._id // eslint-disable-line max-len

    verifiedPatients = await Promise.map(
      chance.n(() => patientUtil.generate({ isVerified: true }), VERIFIED_PATIENTS_COUNT),
      patientData => Patient.create(patientData)
    )

    unverifiedPatients = await Promise.map(
      chance.n(() => patientUtil.generate({ isVerified: false }), UNVERIFIED_PATIENTS_COUNT),
      patientData => Patient.create(patientData)
    )

    verifiedConditions = await Promise.map(
      verifiedPatients,
      patient => patient.createConditionSummary(
        conditionSummaryUtil.generate({
          type: randomConditionId()
        })
      )
    )

    // unverified conditions
    await Promise.map(
      unverifiedPatients,
      patient => patient.createConditionSummary(
        conditionSummaryUtil.generate({
          type: randomConditionId()
        })
      )
    )

    expectedLungCancerCount = _.filter(verifiedConditions, { type: lungCancerCondition._id }).length
    expectedProstateCancerCount = _.filter(verifiedConditions, { type: prostateCancerCondition._id }).length // eslint-disable-line max-len
  })

  after(cleanDB)

  it(`Shoud return ${httpStatus.OK} with conditions sumarry`, (done) => {
    request(app)
      .get(PATH)
      .end((err, { status, body }) => {
        expect(err).to.be.null
        expect(status).to.equal(httpStatus.OK)
        expect(body).to.deep.equal({
          lung_cancer: { total: expectedLungCancerCount },
          prostate_cancer: { total: expectedProstateCancerCount }
        })
        done()
      })
  })
})
