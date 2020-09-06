'use strict'

const mongoose = require('mongoose')
const { AGREEMENT_TYPES } = require('./Agreement.constants')

const agreementsTypesEnum = Object.keys(AGREEMENT_TYPES)
const { Schema } = mongoose
const AgreementSchema = new Schema({
  type: {
    type: String,
    enum: {
      values: agreementsTypesEnum,
      // eslint-disable-next-line max-len
      message: ({ value }) => `invalid agreement type {${value}} must be one of [${agreementsTypesEnum}]`
    },
    required: true
  },
  version: {
    type: String,
    trim: true,
    required: [true, 'Agreement version is required'],
    validate: [{
      validator(value) {
        const pattern = /(\b\d{1,3}\.)(\d{1,3}\.)(\d{1,3}\b)/g
        return pattern.test(value)
      },
      msg: 'Version must have n.n.n format. Ex: 2.1.16 ( 0 <= n <= 999 )'
    }]
  },
  validFrom: Date,
  validThrought: Date,
  url: String
}, {
  timestamps: true,
  collection: 'Agreement'
})

mongoose.model('Agreement', AgreementSchema)
