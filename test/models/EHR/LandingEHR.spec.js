'use strict'

const mongoose = require('mongoose')
const _ = require('lodash')
const MockDate = require('mockdate')
const {
  boot,
  chance,
  expect,
  cleanDB
} = require('../../index')
const { PROVIDERS } = require('../../../src/models/Patient/schemas/ehr-providers/EHRProviders.constants') // eslint-disable-line max-len
const { landingEHRUtil } = require('../../util')

describe('LandingEHR', () => {
  let LandingEHR
  const VALID_PROVIDERS = Object.values(PROVIDERS)
  const UNKNOWN_PROVIDER = chance.pickone(_.difference(chance.n(chance.word, 5), VALID_PROVIDERS))
  
  before(async () => {
    await boot()
    await cleanDB()
    LandingEHR = mongoose.model('LandingEHR')
  })

  afterEach(landingEHRUtil.clean)
  
  after(cleanDB)

  it('Should create a new landingEHR doc', async () => {
    const landingEHRData = landingEHRUtil.generate()
    const mockedDate = new Date()
    MockDate.set(mockedDate)
    await expect(LandingEHR.create(landingEHRData))
      .to.eventually.be.an('object')
      .that.is.instanceOf(LandingEHR)
      .then((data) => {
        expect(data.provider).to.eql(landingEHRData.provider)
        expect(data.rawData).to.deep.equal(landingEHRData.rawData)
        expect(data.patient).to.eql(landingEHRData.patient)
        expect(data.createdAt).to.eql(mockedDate)
        expect(data.updatedAt).to.eql(mockedDate)
      })
    MockDate.reset()
  })

  it('Should fail if patient=undefined', async () => {
    await expect(LandingEHR.create(landingEHRUtil.generate({ patient: undefined })))
      .to.eventually.be.rejectedWith('patient is required')
  })

  it('Should fail if patient=null', async () => {
    await expect(LandingEHR.create(landingEHRUtil.generate({ patient: null })))
      .to.eventually.be.rejectedWith('patient is required')
  })

  it('Should fail if rawData=undefined', async () => {
    await expect(LandingEHR.create(landingEHRUtil.generate({ rawData: undefined })))
      .to.eventually.be.rejectedWith('rawData is required')
  })

  it('Should fail if rawData=null', async () => {
    await expect(LandingEHR.create(landingEHRUtil.generate({ rawData: null })))
      .to.eventually.be.rejectedWith('rawData is required')
  })

  it('Should fail if rawData={}', async () => {
    await expect(LandingEHR.create(landingEHRUtil.generate({ rawData: {} })))
      .to.eventually.be.rejectedWith('rawData cant be empty')
  })

  it(`Should fail if provider=${UNKNOWN_PROVIDER}`, async () => {
    await expect(LandingEHR.create(landingEHRUtil.generate({ provider: UNKNOWN_PROVIDER })))
      .to.eventually.be.rejectedWith(`invalid provider "${UNKNOWN_PROVIDER}", must be one of [${VALID_PROVIDERS}]`) // eslint-disable-line max-len
  })
})
