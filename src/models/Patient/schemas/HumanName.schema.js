'use strict'

const mongoose = require('mongoose')
const {
  USE_TYPE,
  FAMILY_NAME_MAX_LENGTH,
  GIVEN_NAME_MAX_LENGTH,
  PREFIX_NAME_MAX_LENGTH,
  SUFFIX_NAME_MAX_LENGTH
} = require('./HumanName.constants')

const { Schema } = mongoose

const HumanNameSchema = new Schema({
  use: {
    type: String,
    enum: Object.values(USE_TYPE),
    required: true
  },
  family: {
    type: [{
      type: String,
      trim: true,
      required: [true, 'family name should have at least 1 char'],
      maxlength: [FAMILY_NAME_MAX_LENGTH, 'family name can contain at most {MAXLENGTH} chars']
    }]
  },
  given: {
    type: [{
      type: String,
      trim: true,
      required: [true, 'given name should have at least 1 char'],
      maxlength: [GIVEN_NAME_MAX_LENGTH, 'given name can contain at most {MAXLENGTH} chars']
    }],
    required: [true, 'should have at least 1 given name'],
    validate: {
      validator(value) {
        return value.length > 0
      },
      message: 'should have at least 1 given name'
    }
  },
  prefix: [{
    type: String,
    trim: true,
    required: [true, 'prefix must have at least 1 char'],
    maxlength: [PREFIX_NAME_MAX_LENGTH, 'prefix can contain at most {MAXLENGTH} chars']
  }],
  suffix: [{
    type: String,
    trim: true,
    required: [true, 'suffix must have at least 1 char'],
    maxlength: [SUFFIX_NAME_MAX_LENGTH, 'suffix can contain at most {MAXLENGTH} chars']
  }]
}, {
  _id: false
})

module.exports = HumanNameSchema
