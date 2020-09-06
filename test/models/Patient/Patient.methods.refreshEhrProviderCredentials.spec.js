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

describe('Patient.methods.refreshEhrProviderCredentials', () => {
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
    await expect(patient.refreshEhrProviderCredentials(unknownProvider))
      .to.eventually.be.rejectedWith(`EHR Provider [${unknownProvider}] is not supported`)
  })

  describe(`provider=${PROVIDERS.MEDFUSION} without existing connection`, () => {
    it('Should throw an error if provider is not set up', async () => {
      await expect(patient.refreshEhrProviderCredentials(PROVIDERS.MEDFUSION))
        .to.eventually.be.rejectedWith(`Provider "${PROVIDERS.MEDFUSION}" is not set up.`)
    })
  })

  describe(`provider=${PROVIDERS.MEDFUSION} with existing connection`, () => {
    let customerAccessToken
    let userUuid
    let userAccessToken
    let profileId
    let createCustomerAccessTokenScope
    let createUserAccessTokenScope
    let getProfileScope

    beforeEach(async () => {
      const { sandbox } = medfusionUtil
      customerAccessToken = medfusionUtil.createCustomerAccessToken()
      userUuid = chance.guid()
      userAccessToken = medfusionUtil.createUserAccessToken({ userUuid })
      profileId = '1234'
      patient.ehrProviders = {
        [PROVIDERS.MEDFUSION]: {
          userUuid
        }
      }
      await patient.save()
      createCustomerAccessTokenScope = sandbox.tokens.create(customerAccessToken)
      createUserAccessTokenScope = sandbox.users.createAccessToken(customerAccessToken, userUuid, userAccessToken) // eslint-disable-line max-len
      getProfileScope = sandbox.users.profiles(userAccessToken, userUuid, profileId)
    })

    it('Should get new accessToken and profileId', async () => {
      const patientBefore = await Patient.findById(patient.id)
      
      const mockedDate = new Date()
      MockDate.set(mockedDate)
      await patient.refreshEhrProviderCredentials(PROVIDERS.MEDFUSION)
      MockDate.reset()
      
      expect(createCustomerAccessTokenScope.isDone()).to.be.true
      expect(createUserAccessTokenScope.isDone()).to.be.true
      expect(getProfileScope.isDone()).to.be.true
      
      const patientAfter = await Patient.findById(patient.id)
      
      expect(patientAfter.ehrProviders[PROVIDERS.MEDFUSION].toJSON())
        .to.deep.equal({
          userUuid,
          accessToken: userAccessToken,
          mainProfileId: profileId,
          createdAt: patientBefore.ehrProviders[PROVIDERS.MEDFUSION].createdAt,
          updatedAt: mockedDate
        })
    })

    it('Should only get new accessToken', async () => {
      patient.ehrProviders[PROVIDERS.MEDFUSION].mainProfileId = profileId
      await patient.save()

      const patientBefore = await Patient.findById(patient.id)
      
      const mockedDate = new Date()
      MockDate.set(mockedDate)
      await patient.refreshEhrProviderCredentials(PROVIDERS.MEDFUSION)
      MockDate.reset()
      
      expect(createCustomerAccessTokenScope.isDone()).to.be.true
      expect(createUserAccessTokenScope.isDone()).to.be.true
      expect(getProfileScope.isDone()).to.be.true
      
      const patientAfter = await Patient.findById(patient.id)
      
      expect(patientAfter.ehrProviders[PROVIDERS.MEDFUSION].toJSON())
        .to.deep.equal({
          userUuid,
          accessToken: userAccessToken,
          mainProfileId: profileId,
          createdAt: patientBefore.ehrProviders[PROVIDERS.MEDFUSION].createdAt,
          updatedAt: mockedDate
        })
    })

    it('Should replace old accessToken', async () => {
      const oldAccessToken = medfusionUtil.createUserAccessToken({ userUuid })
      patient.ehrProviders[PROVIDERS.MEDFUSION].mainProfileId = profileId
      patient.ehrProviders[PROVIDERS.MEDFUSION].accessToken = oldAccessToken
      await patient.save()

      const patientBefore = await Patient.findById(patient.id)
      
      const mockedDate = new Date()
      MockDate.set(mockedDate)
      await patient.refreshEhrProviderCredentials(PROVIDERS.MEDFUSION)
      MockDate.reset()
      
      expect(createCustomerAccessTokenScope.isDone()).to.be.true
      expect(createUserAccessTokenScope.isDone()).to.be.true
      expect(getProfileScope.isDone()).to.be.true
      
      const patientAfter = await Patient.findById(patient.id)
      
      expect(patientAfter.ehrProviders[PROVIDERS.MEDFUSION].toJSON())
        .to.deep.equal({
          userUuid,
          accessToken: userAccessToken,
          mainProfileId: profileId,
          createdAt: patientBefore.ehrProviders[PROVIDERS.MEDFUSION].createdAt,
          updatedAt: mockedDate
        })
    })
  })
})
