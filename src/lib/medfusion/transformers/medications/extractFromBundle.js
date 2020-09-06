'use strict'

const _ = require('lodash')
const { FHIR_RESOURCE_TYPE } = require('../../constants')
const parseMedicationStatement = require('./parseMedicationStatement')

const extractFromBundle = ({ liveDoc, outDoc = {} }) => {
  const resourceType = _.get(liveDoc, 'data.resourceType')
  if (resourceType !== FHIR_RESOURCE_TYPE.BUNDLE) return { liveDoc, outDoc }
  
  const entry = _.get(liveDoc, 'data.entry', [])
  
  const resources = entry.map((entryObj) => {
    const resource = _.get(entryObj, 'resource')
    return parseMedicationStatement(resource)
  })
  
  const medicationStatement = _.defaultTo(_.first(_.compact(resources)), {})
  _.merge(outDoc, medicationStatement)

  return { liveDoc, outDoc }
}

module.exports = extractFromBundle
