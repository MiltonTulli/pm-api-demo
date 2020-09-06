'use strict'

const MockDate = require('mockdate')
const mongoose = require('mongoose')
const moment = require('moment')
const _ = require('lodash')
const {
  boot,
  expect,
  chance,
  cleanDB
} = require('../../index')

const { patientUtil } = require('../../util')
const { GENDER, SMOKING_STATUS } = require('../../../src/models/Patient/Patient.constants')
const referralConstants = require('../../../src/models/Patient/schemas/Referral.constants')

describe('Patient', () => {
  let Patient
  const validSmokingStatuses = Object.values(SMOKING_STATUS)
  const validAddressUse = Object.values(patientUtil.ADDRESS_USE)
  const validAddressType = Object.values(patientUtil.ADDRESS_TYPE)

  before(async () => {
    await boot()
    await cleanDB()
    Patient = mongoose.model('Patient')
    await Patient.ensureIndexes()
  })
  
  afterEach(async () => {
    await patientUtil.clean()
    MockDate.reset()
  })

  after(cleanDB)

  it('Should create a new Patient', async () => {
    const patientData = patientUtil.generate()
    const createdAt = new Date()
    MockDate.set(createdAt)
    await expect(Patient.create(patientData))
      .to.eventually.be.instanceOf(Patient)
      .then((patient) => {
        const patientJson = patient.toJSON()
        const expectedValues = Object.assign(
          {},
          patientData,
          {
            id: patientJson.id,
            createdAt,
            updatedAt: createdAt,
            isVerified: false,
            isValidated: false,
            hasPortalConnection: false,
            portals: []
          }
        )
        
        expect(patientJson)
          .to.deep.equal(expectedValues)
      })
  })

  it('Should not allow patient without a user', async () => {
    await expect(Patient.create(patientUtil.generate({ user: undefined })))
      .to.eventually.be.rejectedWith('user is required')
  })

  it('Should not allow patient without birthdate', async () => {
    await expect(Patient.create(patientUtil.generate({ birthDate: undefined })))
      .to.eventually.be.rejectedWith('patient must have a birth date')
  })

  it('Shoud not allow birthdates before 1900', async () => {
    await expect(Patient.create(patientUtil.generate({ birthDate: chance.date({ year: 1899 }) })))
      .to.eventually.be.rejectedWith('birth date must be greater than January 1st, 1900 UTC')
  })

  it('Should not allow patient with future birthdate', async () => {
    const nextYear = (new Date()).getFullYear() + 1
    await expect(Patient.create(patientUtil.generate({ birthDate: chance.date({ year: nextYear }) }))) // eslint-disable-line max-len
      .to.eventually.be.rejectedWith('birth date cannot be future')
  })

  it('Should not allow patient without gender', async () => {
    await expect(Patient.create(patientUtil.generate({ gender: undefined })))
      .to.eventually.be.rejectedWith('patient must have a gender')
  })

  it('Should allow only valid genders', async () => {
    const validGenders = Object.values(GENDER)
    const invalidGender = chance.pickone(_.difference(chance.n(chance.word, 5), validGenders))
    
    await expect(Patient.create(patientUtil.generate({ gender: invalidGender })))
      .to.eventually.be.rejectedWith(`invalid gender "${invalidGender}", must be one of [${validGenders}]`) // eslint-disable-line max-len
  })

  it('Should require at least 1 valid name', async () => {
    await expect(Patient.create(patientUtil.generate({ names: [] })))
      .to.eventually.be.rejectedWith('should have at least 1 name')
  })

  it('Should require at least 1 valid name when name is undefined or null', async () => {
    await expect(Patient.create(patientUtil.generate({ names: undefined })))
      .to.eventually.be.rejectedWith('should have at least 1 name')
    
    await expect(Patient.create(patientUtil.generate({ names: null })))
      .to.eventually.be.rejectedWith('should have at least 1 name')
    
    const patientToSave = await Patient.create(patientUtil.generate())
    patientToSave.names = undefined
    await expect(patientToSave.save())
      .to.eventually.be.rejectedWith('should have at least 1 name')
    
    patientToSave.names = null
    await expect(patientToSave.save())
      .to.eventually.be.rejectedWith('should have at least 1 name')
  })

  it('Should not allow name without at least 1 given name', async () => {
    const invalidName = patientUtil.generateName({ given: null })
    await expect(Patient.create(patientUtil.generate({ names: [invalidName] })))
      .to.eventually.be.rejectedWith('should have at least 1 given name')
  })

  it('Should not allow name with invalid given name', async () => {
    const invalidName = patientUtil.generateName({ given: ['', chance.first()] })
    await expect(Patient.create(patientUtil.generate({ names: [invalidName] })))
      .to.eventually.be.rejectedWith('given name should have at least 1 char')
  })

  it('Should not allow patient with invalid smoking status', async () => {
    const invalidSmokingStatus = 'IM_NOT_A_SMOKER'
    await expect(Patient.create(patientUtil.generate({ smokingStatus: invalidSmokingStatus })))
      .to.eventually.be.rejectedWith(`invalid smoking status "${invalidSmokingStatus}", must be one of [${validSmokingStatuses}]`) // eslint-disable-line max-len
  })

  it('Should not allow invalid Address.use', async () => {
    const invalidAddressUse = 'not_an_address_use'
    const invalidAddress = patientUtil.generateAddress({ use: invalidAddressUse })
    await expect(Patient.create(patientUtil.generate({ addresses: [invalidAddress] })))
      .to.eventually.be.rejectedWith(`invalid address use "${invalidAddressUse}", must be one of [${validAddressUse}]`) // eslint-disable-line max-len
  })

  it('Should not allow invalid Address.type', async () => {
    const invalidAddressType = 'not_an_address_type'
    const invalidAddress = patientUtil.generateAddress({ type: invalidAddressType })
    await expect(Patient.create(patientUtil.generate({ addresses: [invalidAddress] })))
      .to.eventually.be.rejectedWith(`invalid address type "${invalidAddressType}", must be one of [${validAddressType}]`) // eslint-disable-line max-len
  })

  it('Should not allow invalid Address.postalCode', async () => {
    const invalidAddressPostalCode = chance.guid()
    const invalidAddress = patientUtil.generateAddress({ postalCode: invalidAddressPostalCode })
    await expect(Patient.create(patientUtil.generate({ addresses: [invalidAddress] })))
      .to.eventually.be.rejectedWith(`invalid postal code "${invalidAddressPostalCode}"`)
  })

  it('Should not allow empty element in Address.lines', async () => {
    const invalidAddress = patientUtil.generateAddress({ lines: ['', chance.address()] })
    await expect(Patient.create(patientUtil.generate({ addresses: [invalidAddress] })))
      .to.eventually.be.rejectedWith('line must have at least 1 char')
  })

  it(`Should not allow lines with more than ${patientUtil.ADDRESS_LINE_MAX_LENGTH} in Address.lines`, async () => { // eslint-disable-line max-len
    const invalidAddressLine = chance.word({ length: patientUtil.ADDRESS_LINE_MAX_LENGTH + 1 })
    const invalidAddress = patientUtil.generateAddress({ lines: [invalidAddressLine] })
    await expect(Patient.create(patientUtil.generate({ addresses: [invalidAddress] })))
      .to.eventually.be.rejectedWith(`line can have at most ${patientUtil.ADDRESS_LINE_MAX_LENGTH} chars`) // eslint-disable-line max-len
  })

  it(`Should not allow city with more than ${patientUtil.ADDRESS_CITY_MAX_LENGTH} in Address.city`, async () => { // eslint-disable-line max-len
    const invalidAddressCity = chance.word({ length: patientUtil.ADDRESS_CITY_MAX_LENGTH + 1 })
    const invalidAddress = patientUtil.generateAddress({ city: invalidAddressCity })
    await expect(Patient.create(patientUtil.generate({ addresses: [invalidAddress] })))
      .to.eventually.be.rejectedWith(`city can have at most ${patientUtil.ADDRESS_CITY_MAX_LENGTH} chars`) // eslint-disable-line max-len
  })

  it(`Should not allow state with more than ${patientUtil.ADDRESS_STATE_MAX_LENGTH} in Address.state`, async () => { // eslint-disable-line max-len
    const invalidAddressState = chance.word({ length: patientUtil.ADDRESS_STATE_MAX_LENGTH + 1 })
    const invalidAddress = patientUtil.generateAddress({ state: invalidAddressState })
    await expect(Patient.create(patientUtil.generate({ addresses: [invalidAddress] })))
      .to.eventually.be.rejectedWith(`state can have at most ${patientUtil.ADDRESS_STATE_MAX_LENGTH} chars`) // eslint-disable-line max-len
  })
  it('Should not allow create referral with invalid email', async () => {
    const invalidEmail = 'INVALID_EMAIL.CO'
    const referral = patientUtil.generateReferral({ email: invalidEmail })
    await expect(Patient.create(patientUtil.generate({ referral })))
      .to.eventually.be.rejectedWith(referralConstants.INVALID_EMAIL_ERROR_MSG)
  })
  it('Should not allow create referral with date before now', async () => {
    const date = moment().subtract(referralConstants.ALLOWABLE_MINUTE_DATE_RANGE + 1, 'm')
    const referral = patientUtil.generateReferral({ date })
    await expect(Patient.create(patientUtil.generate({ referral })))
      .to.eventually.be.rejectedWith(referralConstants.INVALID_DATE_ERROR_MSG)
  })
  it('Should allow create referral with valid date', async () => {
    const now = moment()
    const referral = patientUtil.generateReferral({ date: now })
    await expect(Patient.create(patientUtil.generate({ referral })))
      .to.eventually.be.fulfilled
  })
  // eslint-disable-next-line max-len
  it(`Should not allow create referral with name shorter than ${referralConstants.NAME_MINLENGTH} chars`, async () => {
    const INVALID_NAME = chance.string({ length: referralConstants.NAME_MINLENGTH - 1 })
    const referral = patientUtil.generateReferral({ name: INVALID_NAME })
    await expect(Patient.create(patientUtil.generate({ referral })))
      .to.eventually.be.rejectedWith(referralConstants.MINLENGTH_NAME_ERROR_MSG)
  })
  // eslint-disable-next-line max-len
  it(`Should not allow create referral with name larger than ${referralConstants.NAME_MAXLENGTH} chars`, async () => {
    const INVALID_NAME = chance.string({ length: referralConstants.NAME_MAXLENGTH + 1 })
    const referral = patientUtil.generateReferral({ name: INVALID_NAME })
    await expect(Patient.create(patientUtil.generate({ referral })))
      .to.eventually.be.rejectedWith(referralConstants.MAXLENGTH_NAME_ERROR_MSG)
  })
})
