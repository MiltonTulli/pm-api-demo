'use strict'

const mongoose = require('mongoose')
const { isUUID } = require('validator')
const { SYNC_STATUS } = require('./EHRProviders.constants')

const { Schema } = mongoose
const validSyncStatus = Object.values(SYNC_STATUS)

const MedfusionSchema = new Schema({
  userUuid: {
    type: String,
    validate: {
      validator: isUUID,
      message: ({ value }) => `${value} is not a valid uuid`
    },
    required: [true, 'medfusion userUuid is required']
  },
  mainProfileId: String, // Actually medfusion only allow 1 profile
  accessToken: String,
  lastSync: Date,
  syncStatus: {
    type: String,
    enum: {
      values: validSyncStatus,
      msg: `invalid sync status {VALUE}, must be one of [${validSyncStatus}]`
    }
  }
}, {
  _id: false,
  timestamps: true
})

module.exports = MedfusionSchema
