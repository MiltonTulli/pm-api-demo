'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')
const appDB = require('../src/db')
/* eslint-disable max-len, object-curly-newline, object-property-newline */
const histologySubtypes = [
  { type: 'histology_subtype', typeLabel: 'Histology Sub-Type', label: 'Adenocarcinoma', name: 'adenocarcinoma_histology_subtype', parents: ['nscl_histology'] },
  { type: 'histology_subtype', typeLabel: 'Histology Sub-Type', label: 'Squamous cell lung cancer', name: 'sclc_histology_subtype', parents: ['nscl_histology'] },
  { type: 'histology_subtype', typeLabel: 'Histology Sub-Type', label: 'Large cell lung cancer', name: 'lclc_histology_subtype', parents: ['nscl_histology'] }
]

module.exports = {
  async up() {
    await appDB.connect()
    const Descriptor = mongoose.model('Descriptor')
    const parent = await Descriptor.findOne({ name: 'nscl_histology' })
    await Descriptor.insertMany(_.map(histologySubtypes, histologySubType => _.assign({}, histologySubType, { parents: [parent._id] })))
  },
  down() {}
}
