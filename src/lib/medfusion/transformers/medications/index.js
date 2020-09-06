'use strict'

const _ = require('lodash')
const extractMeta = require('./extractMeta')
const extractFromBundle = require('./extractFromBundle')
const extractFromMedicationStatement = require('./extractFromMedicationStatement')

const transformer = _.flow([extractMeta, extractFromMedicationStatement, extractFromBundle])

module.exports = {
  transformer
}
