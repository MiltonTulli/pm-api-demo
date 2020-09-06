'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')
const BaseEHR = require('./BaseEHR.model')

const { Schema } = mongoose

const ProcedureSchema = new Schema({
  code: {
    snomedCT: { type: Number },
    text: String
  },
  type: { type: Schema.Types.ObjectId, ref: 'Descriptor' },
  descriptors: [{ type: Schema.Types.ObjectId, ref: 'Descriptor' }],
  text: { type: String, trim: true },
  performedDateTime: Date,
  performedPeriod: {
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


BaseEHR.discriminator('Procedure', ProcedureSchema)
