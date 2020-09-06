'use strict'

const mongoose = require('mongoose')
const {
  boot,
  cleanDB,
  expect
} = require('../index')
const { organizationUtil } = require('../util')
const {
  TYPE_ERROR: organizationTypeError,
  NAME_ERROR: organizationNameError,
  ADDRESS_ERROR: organizationAddressError
} = require('../../src/models/Organization/Organization.constants')

const {
  SYSTEM_ERROR: telecomSystemError,
  USE_ERROR: telecomUseError,
  VALUE_ERROR: telecomValueError
} = require('../../src/models/schemas/Telecom/Telecom.constants')

describe('Organization Model', () => {
  let Organization

  before(async () => {
    await boot()
    Organization = mongoose.model('Organization')
  })

  afterEach(async () => {
    await organizationUtil.clean()
  })
  after(cleanDB)
  
  it('Should create new Organization succesfully', async () => {
    const data = organizationUtil.generate()
    const Org = await Organization.create(data)
    await expect(Organization.create(organizationUtil.generate())).to.be.fulfilled
    expect(Org.type).to.be.eql(data.type)
    expect(Org.name).to.be.eql(data.name)
  })

  it('Should fail if organization type is not provided', async () => {
    await expect(Organization.create(organizationUtil.generate({ type: undefined })))
      .to.eventually.be.rejectedWith(organizationTypeError)
  })

  it('Should fail if wrong organization type is provided', async () => {
    const wrongType = 'WRONG_ORGANIZATION_TYPE'
    await expect(Organization.create(organizationUtil.generate({ type: wrongType })))
      .to.be.rejected
  })

  it('Should fail if organization name is not provided', async () => {
    await expect(Organization.create(organizationUtil.generate({ name: undefined })))
      .to.eventually.be.rejectedWith(organizationNameError)
  })

  it('Should fail if wrong organization name is provided', async () => {
    const wrongName = 'ES'
    await expect(Organization.create(organizationUtil.generate({ name: wrongName })))
      .to.eventually.be.rejectedWith(organizationNameError)
  })

  it('Should fail if no organization address is provided', async () => {
    await expect(Organization.create(organizationUtil.generate({ address: [] })))
      .to.eventually.be.rejectedWith(organizationAddressError)
  })

  // Telecom schema test
  it('Should fail if telecom system is not provided', async () => {
    const telecom = organizationUtil.generateTelecomArray(2, { system: undefined })
    await expect(Organization.create(organizationUtil.generate({ telecom })))
      .to.eventually.be.rejectedWith(telecomSystemError)
  })

  it('Should fail if wrong telecom system is provided', async () => {
    const wrongSystem = 'WRONG_TELECOM_SYSTEM'
    const telecom = organizationUtil.generateTelecomArray(2, { system: wrongSystem })
    await expect(Organization.create(organizationUtil.generate({ telecom })))
      .to.be.rejected
  })

  it('Should fail if telecom value is not provided', async () => {
    const telecom = organizationUtil.generateTelecomArray(1, { value: undefined })
    await expect(Organization.create(organizationUtil.generate({ telecom })))
      .to.eventually.be.rejectedWith(telecomValueError)
  })

  it('Should fail if telecom use is not provided', async () => {
    const telecom = organizationUtil.generateTelecomArray(1, { use: undefined })
    await expect(Organization.create(organizationUtil.generate({ telecom })))
      .to.eventually.be.rejectedWith(telecomUseError)
  })

  it('Should fail if wrong telecom use is provided', async () => {
    const wrongUse = 'WRONG_TELECOM_USE'
    const telecom = organizationUtil.generateTelecomArray(2, { use: wrongUse })
    await expect(Organization.create(organizationUtil.generate({ telecom })))
      .to.be.rejected
  })
})
