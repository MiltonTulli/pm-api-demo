'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')

const { Schema } = mongoose

const DescriptorSummaryViewSchema = new Schema({
  type: String,
  name: String,
  label: String,
  total: Number,
  parents: [Schema.Types.ObjectId]
}, {
  timestamps: true,
  collection: 'DescriptorSummaryView',
  toObject: { virtuals: true },
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

mongoose.model('DescriptorSummaryView', DescriptorSummaryViewSchema)
