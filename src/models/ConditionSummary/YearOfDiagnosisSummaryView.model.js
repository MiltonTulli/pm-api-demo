'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')

const { Schema } = mongoose

const YearOfDiagnosisSummaryViewSchema = new Schema({
  _id: String,
  total: Number
}, {
  collection: 'YearOfDiagnosisSummaryView',
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

mongoose.model('YearOfDiagnosisSummaryView', YearOfDiagnosisSummaryViewSchema)
