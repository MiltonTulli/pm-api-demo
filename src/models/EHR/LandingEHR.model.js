'use strict'

const mongoose = require('mongoose')
const _ = require('lodash')
const { PROVIDERS } = require('../Patient/schemas/ehr-providers/EHRProviders.constants')

const { Schema } = mongoose
const providersEnum = Object.values(PROVIDERS)

const LandingEHRSchema = new Schema({
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'patient is required']
  },
  rawData: {
    type: Object,
    required: [true, 'rawData is required'],
    validate: [
      {
        validator(value) {
          return !_.isEmpty(value)
        },
        msg: 'rawData cant be empty'
      }
    ]
  },
  provider: {
    type: String,
    enum: {
      values: providersEnum,
      message: `invalid provider "{VALUE}", must be one of [${providersEnum}]`
    },
    required: [true, 'provider is required']
  }
}, {
  timestamps: true,
  collection: 'LandingEHR'
})

mongoose.model('LandingEHR', LandingEHRSchema)
