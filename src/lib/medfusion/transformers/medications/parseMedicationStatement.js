'use strict'

const _ = require('lodash')
const { FHIR_RESOURCE_TYPE } = require('../../constants')

const parseMedicationStatement = (resource) => {
  const resourceType = _.get(resource, 'resourceType')
  if (resourceType !== FHIR_RESOURCE_TYPE.MEDICATION_STATEMENT) return null

  const note = _.get(resource, 'note')
  const medicationCodeableConcept = _.get(resource, 'contained[0].code')
  const effectivePeriod = _.get(resource, 'effectivePeriod')
  const effectiveDateTime = _.get(resource, 'effectiveDateTime')

  return _.omitBy({
    note,
    medicationCodeableConcept,
    effectiveDateTime,
    effectivePeriod,
    resourceType
  }, _.isNil)
}

module.exports = parseMedicationStatement
