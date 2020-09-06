'use strict'

const mongoose = require('mongoose')
const MockDate = require('mockdate')
const {
  boot,
  cleanDB,
  chance,
  expect
} = require('../../index')
const { patientUtil } = require('../../util')
const { PROVIDERS } = require('../../../src/models/Patient/schemas/ehr-providers/EHRProviders.constants') // eslint-disable-line max-len

describe('Patient.methods.updateProviderLastSync', () => {
  let Patient
  let patient

  before(async () => {
    await boot()
    await cleanDB()
    Patient = mongoose.model('Patient')
  })

  beforeEach(async () => {
    patient = await Patient.create(patientUtil.generate())
  })

  afterEach(async () => {
    await patientUtil.clean()
  })

  after(async () => {
    await cleanDB()
    MockDate.reset()
  })

  describe(`provider=${PROVIDERS.MEDFUSION} without existing connection`, () => {
    it('Should throw an error if provider is not set up', async () => {
      await expect(patient.updateProviderLastSync(PROVIDERS.MEDFUSION))
        .to.eventually.be.rejectedWith(`Provider "${PROVIDERS.MEDFUSION}" is not set up.`)
    })
  })

  describe(`provider=${PROVIDERS.MEDFUSION} with existing connection`, () => {
    let userUuid

    beforeEach(async () => {
      userUuid = chance.guid()
      patient.ehrProviders = {
        [PROVIDERS.MEDFUSION]: {
          userUuid
        }
      }
      await patient.save()
    })

    it('Should set lastSync event if not present', async () => {
      const mockedDate = new Date()
      MockDate.set(mockedDate)
      await patient.updateProviderLastSync(PROVIDERS.MEDFUSION)
      MockDate.reset()

      const patientAfter = await Patient.findById(patient.id)

      expect(patientAfter.ehrProviders[PROVIDERS.MEDFUSION].toJSON())
        .to.have.deep.property('lastSync', mockedDate)
    })

    it('Should update lastSync event if it was present', async () => {
      patient.ehrProviders[PROVIDERS.MEDFUSION].lastSync = new Date()
      await patient.save()

      const mockedDate = new Date()
      MockDate.set(mockedDate)
      await patient.updateProviderLastSync(PROVIDERS.MEDFUSION)
      MockDate.reset()

      const patientAfter = await Patient.findById(patient.id)

      expect(patientAfter.ehrProviders[PROVIDERS.MEDFUSION].toJSON())
        .to.have.deep.property('lastSync', mockedDate)
    })
  })
})
