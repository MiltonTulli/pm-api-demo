'use strict'

const httpStatus = require('http-status')
const mongoose = require('mongoose')
const moment = require('moment')
const _ = require('lodash')
const {
  boot,
  cleanDB,
  app,
  request,
  expect,
  chance
} = require('../../../../index')
const {
  userUtil,
  patientUtil,
  procedureUtil,
  descriptorUtil
} = require('../../../../util')
const { cognito } = require('../../../../util/aws')

const PATH = '/patients/:patientId/ehrs/procedures'

describe(`POST ${PATH}`, () => {
  let patientPath
  let forbiddenPatientPath
  let procedureData
  let user
  let patient
  let forbiddenPatient
  let token
  let User
  let Patient
  let Descriptor
  let procedures
  let proceduresDescriptors
  let expectedProcedureResponse

  const buildPath = patientId => `/patients/${patientId}/ehrs/procedures`

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
    // create base descriptor with other props
    procedures = [
      new Descriptor(descriptorUtil.generate({ type: 'procedure', name: 'chemotherapy' })),
      new Descriptor(descriptorUtil.generate({ type: 'procedure', name: 'surgery' }))
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
    token = cognito.signToken({ email: user.email })
    patientPath = buildPath(patient.id)
    forbiddenPatientPath = buildPath(forbiddenPatient.id)
    const descriptorsSample = chance.pickset(proceduresDescriptors, 2)
    const selectedProcedure = chance.pickone(_.map(procedures))
    procedureData = _.omit(procedureUtil.generate(
      {
        type: selectedProcedure.id, descriptors: _.map(descriptorsSample, 'id') // eslint-disable-line max-len
      }
    ), 'patient')
    expectedProcedureResponse = _.assign({}, procedureData, {
      performedDateTime: procedureData.performedDateTime.toISOString(),
      patient: patient.id,
      type: descriptorResponse(selectedProcedure),
      descriptors: _.map(descriptorsSample, descriptorResponse)
    })
  })

  afterEach(async () => {
    await patientUtil.clean()
    await userUtil.clean()
  })

  after(cleanDB)

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
      .send(procedureData)
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

  it(`Should return ${httpStatus.BAD_REQUEST} if period is wrong`, async () => {
    const start = new Date()
    const end = moment(start).subtract(1, 'hour')
    procedureData.performedPeriod = {
      start,
      end
    }
    const { status, body } = await request(app)
      .post(patientPath)
      .set('Authorization', `Bearer ${token}`)
      .send(procedureData)
    expect(status).to.eql(httpStatus.BAD_REQUEST)
    expect(body).to.eql({
      statusCode: httpStatus.BAD_REQUEST,
      name: httpStatus['400_NAME'],
      message: `child "performedPeriod" fails because [child "end" fails because ["end" must be larger than or equal to "${start.toString()}"]]` // eslint-disable-line max-len
    })
  })

  it(`Should return ${httpStatus.BAD_REQUEST} if period has only end`, async () => {
    const end = new Date()
    procedureData.performedPeriod = {
      end
    }
    const { status, body } = await request(app)
      .post(patientPath)
      .set('Authorization', `Bearer ${token}`)
      .send(procedureData)
    expect(status).to.eql(httpStatus.BAD_REQUEST)
    expect(body).to.eql({
      statusCode: httpStatus.BAD_REQUEST,
      name: httpStatus['400_NAME'],
      message: 'child "performedPeriod" fails because [child "start" fails because ["start" is required]]' // eslint-disable-line max-len
    })
  })

  it(`Should return ${httpStatus.OK} with new procedure`, async () => {
    const { status, body } = await request(app)
      .post(patientPath)
      .set('Authorization', `Bearer ${token}`)
      .send(procedureData)
    expect(status).to.eql(httpStatus.OK)
    expect(body).to.deep.equal(
      _.assign(
        {},
        expectedProcedureResponse,
        {
          id: body.id,
          createdAt: body.createdAt,
          updatedAt: body.updatedAt,
          provider: 'peermedical',
          resourceType: 'Procedure',
          status: 'active'
        }
      )
    )
  })
})
