'use strict'

const Promise = require('bluebird')
const mongoose = require('mongoose')
const appDB = require('../src/db')

/* eslint-disable max-len, object-curly-newline, object-property-newline */
const treatmentsNames = [
  'chemotherapy_procedure',
  'targeted_therapy_procedure',
  'radiation_therapy_procedure',
  'inmunotherapy_procedure',
  'clinical_trial_procedure'
]

const updateTreatmentName = async (treatment) => {
  // eslint-disable-next-line no-param-reassign
  treatment.name = treatment.name.replace('_procedure', '_treatment')
  await treatment.save()
}

module.exports = {
  async up() {
    await appDB.connect()
    const Descriptor = mongoose.model('Descriptor')
    console.log(`Updating type for treatments ${treatmentsNames}`)
    const { n, nModified } = await Descriptor.updateMany({ type: 'procedure', name: { $in: treatmentsNames } }, { type: 'treatment' })
    console.log(`Updated ${nModified} of ${n}`)
    console.log('Replacing _procedure with _treatment')
    const treatments = await Descriptor.find({ type: 'treatment' })
    await Promise.map(treatments, updateTreatmentName)
    console.log('names replaced')
  },
  down() {}
}
