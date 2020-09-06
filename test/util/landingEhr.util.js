'use strict'

const mongoose = require('mongoose')
const { PROVIDERS } = require('../../src/models/Patient/schemas/ehr-providers/EHRProviders.constants') // eslint-disable-line max-len
const { chance } = require('../index')
const medfusion = require('../../src/lib/medfusion')

const clean = () => mongoose.model('LandingEHR').deleteMany({})

const generateCoding = (attrs = {}) => {
  const defaultAttrs = {
    system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
    code: chance.word(),
    ...(chance.bool() && { display: chance.sentence() })
  }
  return Object.assign(defaultAttrs, attrs)
}

const generateCodableConcept = (attrs = {}) => {
  const defaultAttrs = {
    coding: chance.n(generateCoding, chance.integer({ min: 1, max: 3 })),
    ...(chance.bool() && { text: chance.sentence() })
  }
  return Object.assign(defaultAttrs, attrs)
}

const generateDosage = (attrs = {}) => {
  const defaultAttrs = {
    ...(chance.bool() && {
      route: {
        coding: chance.n(generateCoding, chance.integer({ min: 1, max: 3 }))
      }
    }),
    quantityQuantity: {
      unit: '1',
      system: 'http://unitsofmeasure.org',
      code: '1'
    },
    ...(chance.bool() && { asNeededBoolean: chance.bool() })
  }
  return Object.assign(defaultAttrs, attrs)
}

const generateMedicationStatement = (attrs = {}) => {
  const defaultAttrs = {
    identifier: [{ system: chance.word(), value: chance.word() }],
    note: chance.sentence(),
    dosage: [generateDosage()],
    contained: [{
      code: generateCodableConcept(),
      id: chance.integer({ min: 1, max: 3 }),
      resourceType: 'Medication'
    }],
    effectivePeriod: {
      start: chance.date({
        year: chance.integer({ min: 1900, max: 2018 })
      }),
      end: chance.date({
        year: chance.integer({ min: 1900, max: 2018 })
      })
    },
    resourceType: 'MedicationStatement',
    status: 'active'
  }

  return Object.assign(defaultAttrs, attrs)
}

const generateBundle = (attrs = {}) => {
  const defaultAttrs = {
    entry: chance.n(() => ({ resource: generateMedicationStatement() }), 1),
    resourceType: 'Bundle'
  }
  return Object.assign(defaultAttrs, attrs)
}

const generateLiveDoc = (attrs = {}) => {
  const defaultAttrs = {
    '@type': 'ldItemDetail',
    id: chance.hash(),
    type: chance.pickone(Object.values(medfusion.CONSTANTS.RESOURCE_TYPE)),
    createTime: chance.hammertime(),
    modifiedTime: chance.hammertime(),
    isArchived: chance.bool(),
    profileId: chance.natural(),
    sourcePortalIds: chance.n(chance.natural, chance.natural({ min: 1, max: 5 })),
    sourceDocumentIds: chance.n(chance.hash, chance.natural({ min: 1, max: 5 })),
    data: {
      identifier: [{ system: chance.word(), value: chance.word() }],
      note: chance.sentence(),
      dosage: [generateDosage()],
      contained: [{
        code: generateCodableConcept(),
        id: '1',
        resourceType: 'Medication'
      }],
      effectivePeriod: {
        start: chance.date({
          year: chance.integer({ min: 1900, max: 2018 })
        }),
        end: chance.date({
          year: chance.integer({ min: 1900, max: 2018 })
        })
      },
      resourceType: 'MedicationStatement',
      status: 'active'
    }
  }
  return Object.assign(defaultAttrs, attrs)
}

const generate = (attrs = {}) => {
  const defaultAttrs = {
    patient: mongoose.Types.ObjectId(),
    // TODO: add mock data with some real EHR samples
    rawData: {
      '@type': 'ldItemDetail',
      id: chance.hash(),
      type: chance.pickone(Object.values(medfusion.CONSTANTS.RESOURCE_TYPE)),
      createTime: chance.hammertime(),
      modifiedTime: chance.hammertime(),
      isArchived: chance.bool(),
      profileId: chance.natural(),
      sourcePortalIds: chance.n(chance.natural, chance.natural({ min: 1, max: 5 })),
      sourceDocumentIds: chance.n(chance.hash, chance.natural({ min: 1, max: 5 })),
      data: {
        identifier: [{ system: chance.word(), value: chance.word() }],
        note: chance.sentence(),
        dosage: [generateDosage()],
        contained: [{
          code: generateCodableConcept(),
          id: '1',
          resourceType: 'Medication'
        }],
        effectivePeriod: {
          start: chance.date({
            year: chance.integer({ min: 1900, max: 2018 })
          }),
          end: chance.date({
            year: chance.integer({ min: 1900, max: 2018 })
          })
        },
        resourceType: 'MedicationStatement',
        status: 'active'
      }
    },
    provider: chance.pickone(Object.values(PROVIDERS))
  }
  return Object.assign(defaultAttrs, attrs)
}

module.exports = {
  clean,
  generate,
  generateMedicationStatement,
  generateCodableConcept,
  generateLiveDoc,
  generateBundle
}
