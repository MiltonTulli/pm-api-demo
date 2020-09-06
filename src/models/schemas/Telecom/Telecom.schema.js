'use strict'

const mongoose = require('mongoose')
const {
  SYSTEM, USE, SYSTEM_ERROR, USE_ERROR, VALUE_ERROR
} = require('./Telecom.constants')

const { Schema } = mongoose
const systemEnum = Object.values(SYSTEM)
const useEnum = Object.values(USE)


const TelecomSchema = new Schema({
  value: {
    type: String,
    required: [true, VALUE_ERROR]
  },
  system: {
    type: String,
    enum: {
      values: systemEnum,
      // eslint-disable-next-line max-len
      message: ({ value }) => `invalid Telecom system type "${value}" must be one of [${systemEnum}]`
    },
    required: [true, SYSTEM_ERROR]
  },
  use: {
    type: String,
    enum: {
      values: useEnum,
      // eslint-disable-next-line max-len
      message: ({ value }) => `invalid Telecom use type "${value}" must be one of [${useEnum}]`
    },
    required: [true, USE_ERROR]
  }
})

module.exports = TelecomSchema
