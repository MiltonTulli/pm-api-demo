'use strict'

const mongoose = require('mongoose')
const moment = require('moment')
const { chance } = require('../index')
const { GENDER, SMOKING_STATUS } = require('../../src/models/Patient/Patient.constants')
const { USE_TYPE } = require('../../src/models/Patient/schemas/HumanName.constants')
const {
  TYPE: addressType,
  USE: addressUse,
  LINE_MAX_LENGTH: addressLineMaxLength,
  STATE_MAX_LENGTH: addressStateMaxLength,
  CITY_MAX_LENGTH: addressCityMaxlength,
  COUNTRY
} = require('../../src/models/schemas/Address/Address.constants')

const clean = () => mongoose.model('Patient').deleteMany()

const generateReferral = (attrs = {}) => Object.assign({
  email: chance.email(),
  name: chance.name(),
  date: moment().toDate()
}, attrs)

const generateName = (attrs = {}) => {
  const defaultAttrs = {
    use: chance.pickone(Object.values(USE_TYPE)),
    family: chance.n(chance.first, chance.integer({ min: 1, max: 3 })),
    given: chance.n(chance.last, chance.integer({ min: 1, max: 3 })),
    prefix: chance.n(chance.prefix, chance.integer({ min: 1, max: 3 })),
    suffix: chance.n(chance.suffix, chance.integer({ min: 1, max: 3 }))
  }
  return Object.assign(defaultAttrs, attrs)
}

const generateAddress = (attrs = {}) => {
  const defaultAttrs = {
    use: chance.pickone(Object.values(addressUse)),
    type: chance.pickone(Object.values(addressType)),
    postalCode: chance.zip(),
    state: chance.state(),
    country: chance.pickone(Object.values(COUNTRY)),
    lines: chance.n(chance.address, chance.integer({ min: 0, max: 3 }))
  }
  return Object.assign(defaultAttrs, attrs)
}

const generateMedfusionCredentials = (attrs = {}) => {
  const defaultAttrs = {
    userUuid: chance.guid(),
    mainProfileId: chance.integer({ min: 100, max: 9999 }),
    accessToken: chance.guid()
  }
  return Object.assign(defaultAttrs, attrs)
}

const generateSharingOptions = (attrs = {}) => {
  const defaultAttrs = {
    shareInAggregate: chance.bool(),
    shareIndividually: chance.bool(),
    connect: chance.bool()
  }
  return Object.assign(defaultAttrs, attrs)
}

const generate = (attrs = {}) => {
  const defaultAttrs = {
    user: mongoose.Types.ObjectId(),
    names: [generateName()],
    smokingStatus: chance.pickone(Object.values(SMOKING_STATUS)),
    gender: chance.pickone(Object.values(GENDER)),
    addresses: [generateAddress()],
    birthDate: chance.date({
      year: chance.integer({ min: 1900, max: 2018 })
    }),
    sharingOptions: generateSharingOptions(),
    referral: generateReferral()
  }
  return Object.assign(defaultAttrs, attrs)
}

module.exports = {
  clean,
  generate,
  generateName,
  generateAddress,
  generateMedfusionCredentials,
  generateSharingOptions,
  ADDRESS_TYPE: addressType,
  ADDRESS_USE: addressUse,
  ADDRESS_LINE_MAX_LENGTH: addressLineMaxLength,
  ADDRESS_CITY_MAX_LENGTH: addressCityMaxlength,
  ADDRESS_STATE_MAX_LENGTH: addressStateMaxLength,
  SMOKING_STATUS,
  generateReferral
}
