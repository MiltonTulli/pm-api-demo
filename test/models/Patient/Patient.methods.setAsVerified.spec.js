'use strict'

const mongoose = require('mongoose')
const MockDate = require('mockdate')
const nock = require('nock')
const {
  boot,
  cleanDB,
  chance,
  expect
} = require('../../index')
const { apiUrl, campaignId, apiKey } = require('../../../src/lib/growsurf/configs')

const { patientUtil, userUtil } = require('../../util')

describe('Patient.methods.setAsVerified', () => {
  let Patient
  let User
  let patient
  let patientWithReferral
  let user

  const reqheaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}`
  }

  const GROWSURF_URL = `${apiUrl}/campaign/${campaignId}`

  before(async () => {
    if (!nock.isActive()) nock.activate()
    await boot()
    await cleanDB()
    Patient = mongoose.model('Patient')
    User = mongoose.model('User')
  })

  beforeEach(async () => {
    user = await User.create(userUtil.generate())
    patient = await Patient.create(patientUtil.generate({
      user: user.id
    }))
    patientWithReferral = await Patient.create(patientUtil.generate({
      user: user.id,
      referral: {
        growSurfId: chance.word({ length: 5 })
      }
    }))
  })

  afterEach(async () => {
    nock.cleanAll()
    await patientUtil.clean()
    await userUtil.clean()
  })

  after(async () => {
    await cleanDB()
    MockDate.reset()
    nock.restore()
  })

  describe('Patient without referral', () => {
    it('Should set patient as verified and promote user to partner', async () => {
      const mockSuccessResponse = {
        id: '3vxff9',
        firstName: '',
        lastName: '',
        shareUrl: 'https://hoolie.com?grsf=3vxff9',
        email: user.email
      }
    
      // expected body to be sent
      const body = {
        email: user.email,
        referredBy: patient.referral.growSurfId,
        referralStatus: 'CREDIT_AWARDED'
      }

      const scope = nock(GROWSURF_URL, { reqheaders })
        .persist(false)
        .post('/participant', body)
        .reply(200, mockSuccessResponse)

      const mockedDate = new Date()
      MockDate.set(mockedDate)
      await patient.setAsVerified()
      MockDate.reset()

      const patientAfter = await Patient.findById(patient.id)
      const userAfter = await User.findById(user.id)
      expect(patientAfter.isVerified).to.be.true
      expect(userAfter.accountType).to.eql('partner')
      expect(scope.isDone()).to.be.false
    })
  })

  describe('Patient with referral', () => {
    it('Should set patient as verified and promote user to partner', async () => {
      const mockSuccessResponse = {
        id: '3vxff9',
        firstName: '',
        lastName: '',
        shareUrl: 'https://hoolie.com?grsf=3vxff9',
        email: user.email
      }
    
      // expected body to be sent
      const body = {
        email: user.email,
        referredBy: patientWithReferral.referral.growSurfId,
        referralStatus: 'CREDIT_AWARDED'
      }

      const scope = nock(GROWSURF_URL, { reqheaders })
        .persist(false)
        .post('/participant', body)
        .reply(200, mockSuccessResponse)

      const mockedDate = new Date()
      MockDate.set(mockedDate)
      await patientWithReferral.setAsVerified()
      MockDate.reset()

      const patientAfter = await Patient.findById(patientWithReferral.id)
      const userAfter = await User.findById(user.id)
      expect(patientAfter.isVerified).to.be.true
      expect(userAfter.accountType).to.eql('partner')
      expect(scope.isDone()).to.be.true
    })
  })
})
