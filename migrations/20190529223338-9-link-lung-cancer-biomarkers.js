'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const mongoose = require('mongoose')
const appDB = require('../src/db')

/* eslint-disable max-len, object-curly-newline, object-property-newline */
const lungBiomarkers = [
  { type: 'biomarker', typeLabel: 'Biomarker', label: 'HER2', name: 'her2_biomarker' },
  { type: 'biomarker', typeLabel: 'Biomarker', label: 'RET', name: 'ret_biomarker' },
  { type: 'biomarker', typeLabel: 'Biomarker', label: 'NTR1', name: 'ntrk1_biomarker' },
  { type: 'biomarker', typeLabel: 'Biomarker', label: 'MET', name: 'met_biomarker' },
  { type: 'biomarker', typeLabel: 'Biomarker', label: 'MAP2K1', name: 'map2k1_biomarker' },
  { type: 'biomarker', typeLabel: 'Biomarker', label: 'PICK3CA', name: 'pick3ca_biomarker' },
  { type: 'biomarker', typeLabel: 'Biomarker', label: 'NRAS', name: 'nras_biomarker' },
  { type: 'biomarker', typeLabel: 'Biomarker', label: 'DDR2', name: 'ddr2_biomarker' },
  { type: 'biomarker', typeLabel: 'Biomarker', label: 'FGFR1', name: 'fgfr1_biomarker' },
  { type: 'biomarker', typeLabel: 'Biomarker', label: 'FGFR2', name: 'fgfr2_biomarker' },
  { type: 'biomarker', typeLabel: 'Biomarker', label: 'PTEN', name: 'pten_biomarker' },
  { type: 'biomarker', typeLabel: 'Biomarker', label: 'PDGFRA', name: 'pdgfra_biomarker' }
]

const lungBiomarkersNames = _.map(lungBiomarkers, 'name')

const linkBiomarker = async (biomarker, parentId) => biomarker.updateOne({ $addToSet: { parents: parentId } })

const addParentId = (biomarkers, parentId) => _.map(biomarkers, biomarker => _.assign(biomarker, { parents: [parentId] }))

module.exports = {
  async up() {
    await appDB.connect()
    const Descriptor = mongoose.model('Descriptor')
    const parent = await Descriptor.findOne({ name: 'lung_cancer' })
    if (!parent) throw Error('lung_cancer not setted up')

    const unlinkedBiomarkers = await Descriptor.find({ name: lungBiomarkersNames, type: 'biomarker', parents: { $nin: [parent._id] } })
    console.log('Found %O unlinked biomarkers', unlinkedBiomarkers.length)
    await Promise.map(unlinkedBiomarkers, biomarker => linkBiomarker(biomarker, parent._id), { concurrency: 10 })
    let linkedBiomarkers = await Descriptor.find({ name: lungBiomarkersNames, type: 'biomarker', parents: parent._id })
    console.log('Linked %O biomarkers', linkedBiomarkers.length)
    const toInsertNames = _.difference(lungBiomarkersNames, _.map(linkedBiomarkers, 'name'))
    const toInsert = addParentId(_.filter(lungBiomarkers, ({ name }) => _.includes(toInsertNames, name)), parent._id)
    
    console.log('Inserting %O biomarkers', _.map(toInsert, 'name'))
    await Descriptor.insertMany(toInsert, { ordered: false })
    
    // check biomarkers
    linkedBiomarkers = await Descriptor.find({ name: lungBiomarkersNames, type: 'biomarker', parents: parent._id })
    if (linkedBiomarkers.length !== lungBiomarkers.length) {
      throw Error('Some biomarkers were not linked correctly')
    }
  },
  down() {}
}
