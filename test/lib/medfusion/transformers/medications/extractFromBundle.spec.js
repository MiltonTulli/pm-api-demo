'use strict'

/* eslint-disable max-len */

const { expect } = require('../../../../index')
const extractFromBundle = require('../../../../../src/lib/medfusion/transformers/medications/extractFromBundle')
const { landingEHRUtil } = require('../../../../util')
const { FHIR_RESOURCE_TYPE } = require('../../../../../src/lib/medfusion/constants')

describe('Medfusion.transformers.medications.extractFromBundle', () => {
  let liveDoc
  let expetedResult

  before(() => {
    const medicationStatement = landingEHRUtil.generateMedicationStatement()
    const data = landingEHRUtil.generateBundle({ entry: [{ resource: medicationStatement }] })
    liveDoc = landingEHRUtil.generateLiveDoc({ data })
    expetedResult = {
      resourceType: FHIR_RESOURCE_TYPE.MEDICATION_STATEMENT,
      note: medicationStatement.note,
      effectivePeriod: medicationStatement.effectivePeriod,
      medicationCodeableConcept: medicationStatement.contained[0].code
    }
  })

  it('Should return outDoc with medicationStatement', () => {
    const { outDoc } = extractFromBundle({ liveDoc })
    expect(outDoc).to.deep.equal(expetedResult)
  })
})
