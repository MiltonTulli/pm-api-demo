'use strict'

const mongoose = require('mongoose')
const { chance } = require('../index')
const { AGREEMENT_TYPES } = require('../../src/models/Agreement/Agreement.constants')

const clean = () => mongoose.model('Agreement').deleteMany()

// eslint-disable-next-line max-len
const generateVersionNumber = () => `${chance.integer({ min: 0, max: 20 })}.${chance.integer({ min: 0, max: 20 })}.${chance.integer({ min: 0, max: 20 })}`

const generate = (attrs = {}) => {
  const defaultAttrs = {
    type: chance.pickone(Object.values(AGREEMENT_TYPES)),
    version: generateVersionNumber(),
    validFrom: chance.date({
      year: chance.integer({ min: 1900, max: 2018 })
    }),
    url: chance.url()
  }
  return Object.assign(defaultAttrs, attrs)
}

module.exports = {
  clean,
  generate
}
