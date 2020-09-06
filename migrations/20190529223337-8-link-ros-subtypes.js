'use strict'

const Promise = require('bluebird')
const mongoose = require('mongoose')
const appDB = require('../src/db')
/* eslint-disable max-len, object-curly-newline, object-property-newline */
const rosSubTypes = [
  'cd74_biomarker_subtype',
  'slc34a2_biomarker_subtype',
  'gopc_biomarker_subtype',
  'ccdc6_biomarker_subtype',
  'sdc4_biomarker_subtype',
  'tpm3_biomarker_subtype',
  'ezr_biomarker_subtype',
  'lrig3_biomarker_subtype',
  'kdelr2_biomarker_subtype',
  'lima1_biomarker_subtype',
  'msn_biomarker_subtype',
  'cltc_biomarker_subtype',
  'tpd52l1_biomarker_subtype',
  'tmem106b_biomarker_subtype',
  'fam135b_biomarker_subtype',
  'slc6a17_biomarker_subtype'
]

const linkSubtype = async (subtype, parentId) => subtype.updateOne({ $addToSet: { parents: parentId } })


module.exports = {
  async up() {
    await appDB.connect()
    const Descriptor = mongoose.model('Descriptor')
    const parent = await Descriptor.findOne({ name: 'ros1_biomarker' })
    if (!parent) throw Error(' not setted up')
    const subTypes = await Descriptor.find({ name: rosSubTypes })
    await Promise.map(subTypes, subtype => linkSubtype(subtype, parent._id), { concurrency: 10 })
  },
  down() {}
}
