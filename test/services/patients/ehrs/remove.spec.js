'use strict'

const httpStatus = require('http-status')
const mongoose = require('mongoose')
const _ = require('lodash')
const {
  boot,
  cleanDB,
  app,
  request,
  expect,
  chance
} = require('../../../index')
const { userUtil, patientUtil, procedureUtil } = require('../../../util')
const { cognito } = require('../../../util/aws')

const PATH = '/patients/:patientId/ehrs/:ehrId'

describe(`DELETE ${PATH}`, () => {
  let patientPath
  let forbiddenPatientPath
  let user
  let patient
  let ehr
  let otherEhr
  let forbiddenPatient
  let token
  let User
  let Patient
  let Descriptor
  let procedures
  let proceduresDescriptors

  const buildPath = (patientId, ehrId) => `/patients/${patientId}/ehrs/${ehrId}`

  before(async () => {
    await boot()
    await cleanDB()
    User = mongoose.model('User')
    Patient = mongoose.model('Patient')
    Descriptor = mongoose.model('Descriptor')
    // create base descriptor with other props
    procedures = [
      new Descriptor({ type: 'procedure', name: 'chemotherapy', label: 'label' }),
      new Descriptor({ type: 'procedure', name: 'surgery', label: 'label' })
    ]

    proceduresDescriptors = [
      new Descriptor({
        type: 'medicine',
        label: 'Alectinib',
        name: 'alectinib',
        parents: [procedures[0].id]
      }),
      new Descriptor({
        type: 'medicine',
        label: 'Medicine 2',
        name: 'medicine2',
        parents: [procedures[0].id]
      }),
      new Descriptor({
        type: 'surgery_type',
        label: 'Surgery type',
        name: 'lobectomy',
        parents: [procedures[1].id]
      })
    ]
    await Descriptor.insertMany([
      ...procedures,
      ...proceduresDescriptors
    ])
  })

  beforeEach(async () => {
    user = await User.create(userUtil.generate())
    patient = await user.createDefaultPatient(patientUtil.generate())
    forbiddenPatient = await Patient.create(patientUtil.generate())
    ehr = await patient.createProcedure(procedureUtil.generate(
      {
        type: chance.pickone(_.map(procedures, 'id')),
        descriptors: chance.pickset(_.map(proceduresDescriptors, 'id'), 2)
      }
    ))
    otherEhr = await patient.createProcedure(procedureUtil.generate(
      {
        type: chance.pickone(_.map(procedures, 'id')),
        descriptors: chance.pickset(_.map(proceduresDescriptors, 'id'), 2)
      }
    ))
    token = cognito.signToken({ email: user.email })
    patientPath = buildPath(patient.id, otherEhr.id)
    forbiddenPatientPath = buildPath(forbiddenPatient.id, ehr.id)
  })

  afterEach(async () => {
    await patientUtil.clean()
    await userUtil.clean()
  })

  after(cleanDB)

  it(`Shoud return ${httpStatus.UNAUTHORIZED} if no authenticated`, (done) => {
    request(app)
      .delete(patientPath)
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
      .delete(forbiddenPatientPath)
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

  it(`Should return ${httpStatus.OK} and remove the ehr`, async () => {
    const { status } = await request(app)
      .delete(patientPath)
      .set('Authorization', `Bearer ${token}`)
    expect(status).to.equal(httpStatus.OK)
    const otherEhrAfter = await mongoose.model('EHR').findById(otherEhr.id)
    expect(otherEhrAfter).to.be.null
    const ehrAfter = await mongoose.model('EHR').findById(ehr.id)
    expect(ehrAfter).not.to.be.null
  })
})
