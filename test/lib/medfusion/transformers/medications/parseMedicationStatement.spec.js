'use strict'

/* eslint-disable max-len */

const _ = require('lodash')
const { chance, expect } = require('../../../../index')
const parseMedicationStatement = require('../../../../../src/lib/medfusion/transformers/medications/parseMedicationStatement')
const { FHIR_RESOURCE_TYPE } = require('../../../../../src/lib/medfusion/constants')
const { landingEHRUtil } = require('../../../../util')

describe('Medfusion.transformers.medications.parseMedicationStatement', () => {
  const resourceTypes = Object.values(FHIR_RESOURCE_TYPE)
  const notMedicationStatement = _.without(resourceTypes, FHIR_RESOURCE_TYPE.MEDICATION_STATEMENT)
  let fullMedicationStatement
  let expetedParsedData

  before(() => {
    fullMedicationStatement = landingEHRUtil.generateMedicationStatement()
    expetedParsedData = {
      resourceType: FHIR_RESOURCE_TYPE.MEDICATION_STATEMENT,
      note: fullMedicationStatement.note,
      effectivePeriod: fullMedicationStatement.effectivePeriod,
      medicationCodeableConcept: fullMedicationStatement.contained[0].code
    }
  })

  it(`should return null if resourceType is not ${FHIR_RESOURCE_TYPE.MEDICATION_STATEMENT}`, () => {
    const parsedData = parseMedicationStatement({ resourceType: chance.pickone(notMedicationStatement) })
    expect(parsedData).to.be.null
  })

  it('Should return null if undefined is provided', () => {
    const parsedData = parseMedicationStatement()
    expect(parsedData).to.be.null
  })

  it('Should parse medication data', () => {
    const parsedData = parseMedicationStatement(fullMedicationStatement)
    expect(parsedData).not.to.be.null
    expect(parsedData).of.deep.equal(expetedParsedData)
  })
})
