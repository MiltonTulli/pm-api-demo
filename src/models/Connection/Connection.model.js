'use strict'

const mongoose = require('mongoose')
const { PROVIDERS } = require('../Patient/schemas/ehr-providers/EHRProviders.constants')

const { Schema } = mongoose

const ConnectionSchema = new Schema({
  provider: { type: String, enum: [PROVIDERS.MEDFUSION] },
  providerPortalId: String,
  portalType: String,
  portalName: String,
  status: String,
  hasEverSuccess: Boolean,
  isDeleted: Boolean,
  deletedDateTime: Date,
  lastRefreshRequestDate: Date,
  lastSuccessfullPull: Date,
  refreshableAt: Date,
  patient: { type: mongoose.Types.ObjectId, ref: 'Patient' }
}, {
  collection: 'Connection'
})

mongoose.model('Connection', ConnectionSchema)
