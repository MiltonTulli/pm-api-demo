'use strict'

const mongoose = require('mongoose')
const MockDate = require('mockdate')
const moment = require('moment')

const {
  boot,
  cleanDB,
  chance,
  expect
} = require('../../index')
const { patientUtil } = require('../../util')
const { PROVIDERS } = require('../../../src/models/Patient/schemas/ehr-providers/EHRProviders.constants') // eslint-disable-line max-len

describe('Patient.statics.findByProviderSyncedBeforeDate', () => {
  let Patient
  let patients

  before(async () => {
    await boot()
    await cleanDB()
    Patient = mongoose.model('Patient')
  })

  beforeEach(async () => {
    const patientsData = chance.n(patientUtil.generate, chance.natural({ min: 3, max: 5 }))
    patients = await Promise.all(patientsData.map(patient => Patient.create(patient)))
  })

  afterEach(async () => {
    await patientUtil.clean()
  })

  after(async () => {
    await cleanDB()
    MockDate.reset()
  })

  describe(`provider=${PROVIDERS.MEDFUSION} without existing connection`, () => {
    it('Should return an empty array', async () => {
      await expect(Patient.findByProviderSyncedBeforeDate(PROVIDERS.MEDFUSION, new Date()))
        .to.eventually.be.an('array').that.is.empty
    })
  })

  describe(`provider=${PROVIDERS.MEDFUSION} with existing connection`, () => {
    let userUuid

    beforeEach(async () => {
      await Promise.all(patients.map(async (patient) => {
        userUuid = chance.guid()
        const updatedPatient = patient
        updatedPatient.ehrProviders = {
          [PROVIDERS.MEDFUSION]: {
            userUuid
          }
        }
        return updatedPatient.save()
      }))

      patients = await Patient.find({})
    })

    it('Should return all patients that were never synced', async () => {
      await expect(Patient.findByProviderSyncedBeforeDate(PROVIDERS.MEDFUSION, new Date()))
        .to.eventually.be.an('array').that.has.lengthOf(patients.length)
    })

    it('Should return all patients that were synced before date', async () => {
      const threshold = chance.natural({ min: 10, max: 20 })

      const patientsBelow = await patients.reduce(async (accPromise, patient) => {
        const acc = await accPromise
        const syncDate = chance.natural({ min: 1, max: 30 })
        const mockedDate = moment().subtract(syncDate, 'days').toDate()
        MockDate.set(mockedDate)
        await patient.updateProviderLastSync(PROVIDERS.MEDFUSION)
        MockDate.reset()
        if (syncDate >= threshold) {
          acc.push(Object.assign({}, { _id: patient._id }))
        }
        return acc
      }, Promise.resolve([]))

      const date = moment().subtract(threshold, 'days').toDate()
      await expect(Patient.findByProviderSyncedBeforeDate(PROVIDERS.MEDFUSION, date))
        .to.eventually.be.an('array')
        .that.has.deep.members(patientsBelow)
    })
  })
})
