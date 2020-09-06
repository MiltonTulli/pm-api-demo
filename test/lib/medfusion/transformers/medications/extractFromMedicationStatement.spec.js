'use strict'

/* eslint-disable max-len */

const { expect } = require('../../../../index')
const extractFromMedicationStatement = require('../../../../../src/lib/medfusion/transformers/medications/extractFromMedicationStatement')
const { landingEHRUtil } = require('../../../../util')
const { FHIR_RESOURCE_TYPE } = require('../../../../../src/lib/medfusion/constants')

describe('Medfusion.transformers.medications.extractFromMedicationStatement', () => {
  let liveDoc
  let expetedResult

  before(() => {
    const data = landingEHRUtil.generateMedicationStatement()
    liveDoc = landingEHRUtil.generateLiveDoc({ data })
    expetedResult = {
      resourceType: FHIR_RESOURCE_TYPE.MEDICATION_STATEMENT,
      note: data.note,
      effectivePeriod: data.effectivePeriod,
      medicationCodeableConcept: data.contained[0].code
    }
  })

  it('Should return outDoc with medicationStatement', () => {
    const { outDoc } = extractFromMedicationStatement({ liveDoc })
    expect(outDoc).to.deep.equal(expetedResult)
  })
})
