'use strict'

const _ = require('lodash')
const { FHIR_RESOURCE_TYPE } = require('../../constants')
const parseMedicationStatement = require('./parseMedicationStatement')

const extractFromMedicationStatement = ({ liveDoc, outDoc = {} }) => {
  const resourceType = _.get(liveDoc, 'data.resourceType')
  if (resourceType !== FHIR_RESOURCE_TYPE.MEDICATION_STATEMENT) return { liveDoc, outDoc }
  
  const medicationStatement = _.defaultTo(parseMedicationStatement(_.get(liveDoc, 'data')), {})
  _.merge(outDoc, medicationStatement)
  
  return { liveDoc, outDoc }
}

module.exports = extractFromMedicationStatement
