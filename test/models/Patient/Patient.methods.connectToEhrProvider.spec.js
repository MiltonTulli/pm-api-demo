'use strict'

const _ = require('lodash')
const nock = require('nock')
const mongoose = require('mongoose')
const MockDate = require('mockdate')
const {
  boot,
  cleanDB,
  chance,
  expect
} = require('../../index')
const { patientUtil, medfusionUtil } = require('../../util')
const { PROVIDERS } = require('../../../src/models/Patient/schemas/ehr-providers/EHRProviders.constants') // eslint-disable-line max-len

describe('Patient.methods.connectToEhrProvider', () => {
  let Patient
  let patient
  const unknownProviders = _.difference(chance.n(chance.word, 5), Object.values(PROVIDERS))

  before(async () => {
    await boot()
    await cleanDB()
    Patient = mongoose.model('Patient')
    if (!nock.isActive()) nock.activate()
  })

  beforeEach(async () => {
    patient = await Patient.create(patientUtil.generate())
  })

  afterEach(async () => {
    nock.cleanAll()
    await patientUtil.clean()
  })

  after(async () => {
    nock.restore()
    await cleanDB()
    MockDate.reset()
  })

  it('Should throw an error if provider is unknown', async () => {
    const unknownProvider = chance.pickone(unknownProviders)
    await expect(patient.connectToEhrProvider(unknownProvider))
      .to.eventually.be.rejectedWith(`EHR Provider [${unknownProvider}] is not supported`)
  })

  describe(`provider=${PROVIDERS.MEDFUSION} with existing connection`, () => {
    beforeEach(async () => {
      patient.ehrProviders = {
        [PROVIDERS.MEDFUSION]: {
          userUuid: chance.guid()
        }
      }
      await patient.save()
    })
    
    it('Should not create medfusion user', async () => {
      const { sandbox } = medfusionUtil
      const customerAccessToken = medfusionUtil.createCustomerAccessToken()
      const createCustomerAccessTokenScope = sandbox.tokens.create(customerAccessToken)
      
      const patientBefore = await Patient.findById(patient.id)
      
      await patient.connectToEhrProvider(PROVIDERS.MEDFUSION)
      
      expect(createCustomerAccessTokenScope.isDone()).to.be.false
      
      const patientAfter = await Patient.findById(patient.id)
      
      expect(patientAfter.ehrProviders[PROVIDERS.MEDFUSION].toJSON())
        .to.deep.equal(patientBefore.ehrProviders[PROVIDERS.MEDFUSION].toJSON())
    })
  })

  describe(`provider=${PROVIDERS.MEDFUSION} without existing connection`, () => {
    it('Should create medfusion user', async () => {
      const { sandbox } = medfusionUtil
      
      const customerAccessToken = medfusionUtil.createCustomerAccessToken()
      const userUuid = chance.guid()
      
      const createCustomerAccessTokenScope = sandbox.tokens.create(customerAccessToken)
      const createUserScope = sandbox.users.create(customerAccessToken, userUuid)
      
      const patientBefore = await Patient.findById(patient.id)
      expect(patientBefore.ehrProviders).to.be.undefined
      
      const mockedDate = new Date()
      MockDate.set(mockedDate)
      await patient.connectToEhrProvider(PROVIDERS.MEDFUSION)
      MockDate.reset()
      
      expect(createCustomerAccessTokenScope.isDone()).to.be.true
      expect(createUserScope.isDone()).to.be.true
      
      const patientAfter = await Patient.findById(patient.id)
      
      expect(patientAfter.ehrProviders[PROVIDERS.MEDFUSION].toJSON())
        .to.deep.equal({
          userUuid,
          createdAt: mockedDate,
          updatedAt: mockedDate
        })
    })
  })
})
