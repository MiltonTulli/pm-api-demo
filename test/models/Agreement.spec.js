'use strict'

const mongoose = require('mongoose')
const {
  boot,
  cleanDB,
  expect
} = require('../index')
const { agreementUtil } = require('../util')
const { AGREEMENT_TYPES } = require('../../src/models/Agreement/Agreement.constants')

const validAgreementsTypes = Object.keys(AGREEMENT_TYPES)

describe('Agreement', () => {
  let Agreement

  before(async () => {
    await boot()
    Agreement = mongoose.model('Agreement')
  })

  afterEach(async () => {
    await agreementUtil.clean()
  })
  after(cleanDB)

  it('Should fail if version is not provided', async () => {
    const errorMsg = 'Agreement validation failed: version: Agreement version is required'
    await expect(Agreement.create(agreementUtil.generate({ version: '' })))
      .to.eventually.be.rejectedWith(errorMsg)
  })
  it('Should fail if invalid version format is provided', async () => {
    const errorMsg = 'Version must have n.n.n format. Ex: 2.1.16 ( 0 <= n <= 999 )'
    await expect(Agreement.create(agreementUtil.generate({ version: '1.2' })))
      .to.eventually.be.rejectedWith(errorMsg)
    await expect(Agreement.create(agreementUtil.generate({ version: 'invalidVersion' })))
      .to.eventually.be.rejectedWith(errorMsg)
    await expect(Agreement.create(agreementUtil.generate({ version: '1.222.9999' })))
      .to.eventually.be.rejectedWith(errorMsg)
  })
  it('Should fail if invalid type is provided', async () => {
    const invalidType = 'invalidType'
    // eslint-disable-next-line max-len
    const errMsg = `invalid agreement type {${invalidType}} must be one of [${validAgreementsTypes}]`
    await expect(Agreement.create(agreementUtil.generate({ type: invalidType })))
      .to.eventually.be.rejectedWith(errMsg)
  })
})
