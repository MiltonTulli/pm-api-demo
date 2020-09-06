'use strict'

const Promise = require('bluebird')
const mongoose = require('mongoose')
const appDB = require('../src/db')
/* eslint-disable max-len, object-curly-newline, object-property-newline */
const alkSubTypes = ['elm4_biomarker_subtype', 'hip4_biomarker_subtype']

const linkSubtype = async (subtype, parentId) => subtype.updateOne({ $addToSet: { parents: parentId } })


module.exports = {
  async up() {
    await appDB.connect()
    const Descriptor = mongoose.model('Descriptor')
    const parent = await Descriptor.findOne({ name: 'alk_biomarker' })
    if (!parent) throw Error('alk_biomarker not setted up')
    const subTypes = await Descriptor.find({ name: alkSubTypes })
    await Promise.map(subTypes, subtype => linkSubtype(subtype, parent._id), { concurrency: 10 })
  },
  down() {}
}
