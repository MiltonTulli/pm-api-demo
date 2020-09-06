'use strict'

const mongoose = require('mongoose')
const { PROVIDERS } = require('../Patient/schemas/ehr-providers/EHRProviders.constants')

const { Schema } = mongoose

const providersEnum = Object.values(PROVIDERS)

const PortalSchema = new Schema({
  provider: {
    type: String,
    enum: {
      values: providersEnum,
      message: `invalid provider "{VALUE}", must be one of [${providersEnum}]`
    },
    required: [true, 'portal must have a provider']
  },
  sourceId: {
    type: String,
    required: [true, 'portal must have a sourceId']
  },
  name: String,
  url: String,
  type: String, // CERNER, EPIC, VA, ... we dont have all list of types.
  location: String
}, {
  collection: 'Portal'
})

PortalSchema.index({ provider: 1, sourceId: 1 }, { unique: true })

mongoose.model('Portal', PortalSchema)
