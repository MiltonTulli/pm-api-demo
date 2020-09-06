'use strict'

const { Schema } = require('mongoose')

const SharingOptionsSchema = new Schema({
  shareInAggregate: {
    type: Boolean,
    default: false
  },
  shareIndividually: {
    type: Boolean,
    default: false
  },
  connect: {
    type: Boolean,
    default: false
  }
}, {
  _id: false
})

module.exports = SharingOptionsSchema
