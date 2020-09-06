'use strict'

const Promise = require('bluebird')
const mongoose = require('mongoose')
const _ = require('lodash')
const httpStatus = require('http-status')
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
  descriptorUtil
} = require('../../../util')

const { cognito } = require('../../../util/aws')

const PATH = '/patients/:patientId/peers/random'

const TOTAL_UNVERIFED_PATIENTS = 5
const TOTAL_VERIFIED_PATIENTS = 5

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
  
  const createPatients = (n, attrs) => Promise.map(
    chance.n(() => patientUtil.generate(attrs), n), p => Patient.create(p)
  )

  const buildPath = patientId => `/patients/${patientId}/peers/random`


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
    await createPatients(TOTAL_VERIFIED_PATIENTS, { isVerified: true })
    await createPatients(TOTAL_UNVERIFED_PATIENTS, { isVerified: false })
    token = cognito.signToken({ email: user.email })
    patientPath = buildPath(patient.id)
    forbiddenPatientPath = buildPath(forbiddenPatient.id)
  })
  afterEach(patientUtil.clean)
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

  it(`Should return ${httpStatus.FORBIDDEN} if patient doesnt belongs to user`, (done) => {
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

  it(`Should return ${httpStatus.OK} with n verified random patients`, (done) => {
    const n = chance.integer({ min: 2, max: TOTAL_VERIFIED_PATIENTS })
    request(app)
      .get(patientPath)
      .set('Authorization', `Bearer ${token}`)
      .query({ n })
      .end((err, { status, body: peers }) => {
        expect(err).to.be.null
        expect(status).to.equal(httpStatus.OK)
        expect(peers).to.be.an('array').that.has.lengthOf(n)
        expect(_.uniqBy(peers, 'id')).to.have.lengthOf(n)
        expect(_.every(peers, { isVerified: true })).to.be.true
        done()
      })
  })

  it(`Should return ${httpStatus.OK} with verified patients only`, (done) => {
    const n = TOTAL_VERIFIED_PATIENTS + 1
    request(app)
      .get(patientPath)
      .set('Authorization', `Bearer ${token}`)
      .query({ n })
      .end((err, { status, body: peers }) => {
        expect(err).to.be.null
        expect(status).to.equal(httpStatus.OK)
        expect(peers).to.be.an('array').that.has.lengthOf(TOTAL_VERIFIED_PATIENTS)
        expect(_.uniqBy(peers, 'id')).to.have.lengthOf(TOTAL_VERIFIED_PATIENTS)
        expect(_.every(peers, { isVerified: true })).to.be.true
        done()
      })
  })
})
