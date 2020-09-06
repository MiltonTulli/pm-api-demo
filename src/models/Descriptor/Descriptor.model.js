'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')
const { DESCRIPTOR_STRING_MAX_LENGTH } = require('./Descriptor.constants')

const { Schema } = mongoose

const DescriptorSchema = new Schema({
  type: {
    type: String,
    trim: true,
    required: [true, 'type is required'],
    maxlength: [
      DESCRIPTOR_STRING_MAX_LENGTH,
      `type can have at most ${DESCRIPTOR_STRING_MAX_LENGTH}`
    ]
  },
  name: {
    type: String,
    trim: true,
    required: [true, 'name is required'],
    maxlength: [
      DESCRIPTOR_STRING_MAX_LENGTH,
      `name can have at most ${DESCRIPTOR_STRING_MAX_LENGTH}`
    ]
  },
  label: {
    type: String,
    trim: true,
    required: [true, 'label is required'],
    maxlength: [
      DESCRIPTOR_STRING_MAX_LENGTH,
      `label can have at most ${DESCRIPTOR_STRING_MAX_LENGTH}`
    ]
  },
  description: {
    type: String,
    trim: true,
    maxlength: [
      DESCRIPTOR_STRING_MAX_LENGTH,
      `description can have at most ${DESCRIPTOR_STRING_MAX_LENGTH}`
    ]
  },
  order: Number,
  snomedCT: Number,
  parents: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Descriptor'
    }
  ]
}, {
  timestamps: true,
  collection: 'Descriptor',
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

DescriptorSchema.virtual('descendants', {
  ref: 'Descriptor',
  localField: '_id',
  foreignField: 'parents',
  options: { sort: { label: 1 } }
})

DescriptorSchema.methods.filterDescriptors = async function filterDescriptors(descriptorsIds) {
  const root = this
  const Descriptor = mongoose.model('Descriptor')
  const descriptorMap = await Descriptor.aggregate([
    { $match: { _id: root._id } },
    {
      $graphLookup: {
        from: 'Descriptor',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parents',
        as: 'filteredDescriptors',
        restrictSearchWithMatch: { _id: { $in: _.map(descriptorsIds, mongoose.Types.ObjectId) } }
      }
    }
  ])
  return _.get(descriptorMap, '[0].filteredDescriptors', [])
}

mongoose.model('Descriptor', DescriptorSchema)
