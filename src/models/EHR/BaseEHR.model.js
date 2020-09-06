'use strict'

const mongoose = require('mongoose')
const { PROVIDERS } = require('../Patient/schemas/ehr-providers/EHRProviders.constants')
const { STATUS } = require('./EHR.constants')

const { Schema } = mongoose
const statusEnum = Object.values(STATUS)
const providersEnum = Object.values(PROVIDERS)

const BaseEHRSchema = new Schema({
  liveDocId: {
    type: String,
    trim: true
  },
  provider: {
    type: String,
    default: PROVIDERS.PEERMEDICAL,
    enum: {
      values: providersEnum,
      message: `invalid provider "{VALUE}", must be one of [${providersEnum}]`
    },
    required: [true, 'provider is required']
  },
  status: {
    type: String,
    required: [true, 'status is required'],
    default: STATUS.ACTIVE,
    enum: {
      values: statusEnum,
      message: `invalid status "{VALUE}", must be one of [${statusEnum}]`
    }
  },
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'patient is required']
  }
}, {
  timestamps: true,
  discriminatorKey: 'resourceType',
  collection: 'Ehr'
})

module.exports = mongoose.model('EHR', BaseEHRSchema)
