'use strict'

const mongoose = require('mongoose')
const _ = require('lodash')
const { chance } = require('../index')
const { TYPE: organizationType } = require('../../src/models/Organization/Organization.constants')
const {
  SYSTEM: telecomSystem,
  USE: telecomUse
} = require('../../src/models/schemas/Telecom/Telecom.constants')

const {
  TYPE: addressType,
  USE: addressUse,
  COUNTRY
} = require('../../src/models/schemas/Address/Address.constants')

const clean = () => mongoose.model('Organization').deleteMany()

const generateTelecomArray = (numOfItems, attrs = {}) => {
  const item = Object.assign({
    system: chance.pickone(Object.values(telecomSystem)),
    value: chance.string(),
    use: chance.pickone(Object.values(telecomUse))
  }, attrs)
 
  return _.times(numOfItems, _.constant(item))
}
const generateAddress = () => ({
  use: chance.pickone(Object.values(addressUse)),
  type: chance.pickone(Object.values(addressType)),
  postalCode: chance.zip(),
  state: chance.state(),
  country: chance.pickone(Object.values(COUNTRY)),
  lines: chance.n(chance.address, chance.integer({ min: 0, max: 3 }))
})
 
const generate = (attrs = {}) => {
  const defaultAttrs = {
    type: chance.pickone(Object.values(organizationType)),
    name: chance.name(),
    alias: [chance.name(), chance.name()],
    telecom: generateTelecomArray(chance.integer({ min: 0, max: 3 })),
    address: [generateAddress()]
  }
  return Object.assign(defaultAttrs, attrs)
}

module.exports = {
  clean,
  generate,
  generateTelecomArray
}
