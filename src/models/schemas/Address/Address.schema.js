'use strict'

const mongoose = require('mongoose')
const { isPostalCode } = require('validator')
const {
  USE,
  TYPE,
  LINE_MAX_LENGTH,
  STATE_MAX_LENGTH,
  CITY_MAX_LENGTH,
  COUNTRY
} = require('./Address.constants')

const { Schema } = mongoose

const countryEnum = Object.values(COUNTRY)
const useEnum = Object.values(USE)
const typeEnum = Object.values(TYPE)

const AddressSchema = new Schema({
  use: {
    type: String,
    enum: {
      values: useEnum,
      message: `invalid address use "{VALUE}", must be one of [${useEnum}]`
    },
    required: [true, 'use is required']
  },
  type: {
    type: String,
    enum: {
      values: typeEnum,
      message: `invalid address type "{VALUE}", must be one of [${typeEnum}]`
    },
    required: [true, 'type is required']
  },
  postalCode: {
    type: String,
    validate: [{
      validator(value) {
        return isPostalCode(value, 'US')
      },
      message: 'invalid postal code "{VALUE}"'
    }]
  },
  city: {
    type: String,
    trim: true,
    maxlength: [CITY_MAX_LENGTH, 'city can have at most {MAXLENGTH} chars']
  },
  country: {
    type: String,
    default: COUNTRY.USA,
    required: [true, 'country is required'],
    enum: {
      values: countryEnum,
      message: `invalid country "{VALUE}", must be one of [${countryEnum}]`
    }
  },
  state: {
    type: String,
    trim: true,
    maxlength: [STATE_MAX_LENGTH, 'state can have at most {MAXLENGTH} chars']
  },
  lines: [
    {
      type: String,
      trim: true,
      required: [true, 'line must have at least 1 char'],
      maxlength: [LINE_MAX_LENGTH, 'line can have at most {MAXLENGTH} chars']
    }
  ]
}, {
  _id: false
})

module.exports = AddressSchema
