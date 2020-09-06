'use strict'

const mongoose = require('mongoose')
const _ = require('lodash')
const { AddressSchema, TelecomSchema } = require('../schemas')
const {
  TYPE, TYPE_ERROR, NAME_ERROR, ADDRESS_ERROR, NAME_MIN_LENGTH
} = require('./Organization.constants')

const { Schema } = mongoose

const typeEnum = Object.values(TYPE)

const OrganizationSchema = new Schema({
  type: {
    type: String,
    enum: {
      values: typeEnum,
      // eslint-disable-next-line max-len
      message: ({ value }) => `invalid Organization type "${value}" must be one of [${typeEnum}]`
    },
    required: [true, TYPE_ERROR]
  },
  name: {
    type: String,
    trim: true,
    required: [true, NAME_ERROR],
    minlength: [NAME_MIN_LENGTH, NAME_ERROR]
  },
  alias: [String],
  telecom: [TelecomSchema],
  address: {
    type: [AddressSchema],
    validate: [{
      validator(value) {
        return !_.isEmpty(value)
      },
      msg: ADDRESS_ERROR
    }],
    required: true
  }
}, {
  timestamps: true,
  collection: 'Organization'
})

mongoose.model('Organization', OrganizationSchema)
