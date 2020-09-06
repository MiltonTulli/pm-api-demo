'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')
const BaseEHR = require('./BaseEHR.model')
const CodeableConceptSchema = require('./schemas/CodeableConcept.schema')

const { Schema } = mongoose

const MedicationStatementSchema = new Schema({
  medicationCodeableConcept: {
    type: CodeableConceptSchema,
    required: [true, 'medication codeable concept is required']
  },
  text: { type: String, trim: true },
  note: { type: String, trim: true },
  meta: { type: Object },
  effectiveDateTime: Date,
  effectivePeriod: {
    start: Date,
    end: Date
  }
}, {
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform(doc, ret) {
      const descriptorData = _.omit(ret, ['_id'])
      descriptorData.id = ret._id
      return descriptorData
    }
  }
})


BaseEHR.discriminator('MedicationStatement', MedicationStatementSchema)
