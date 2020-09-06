'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')
const { CLINICAL_STATUS } = require('../EHR/Condition.constants')

const { Schema } = mongoose
const clinicalStatusEnum = Object.values(CLINICAL_STATUS)

const ExpandedConditionViewSchema = new Schema({
  patient: Object,
  type: { type: Schema.Types.ObjectId, ref: 'Descriptor' },
  clinicalStatus: {
    type: String,
    trim: true,
    required: [true, 'clinical status is required'],
    enum: {
      values: clinicalStatusEnum,
      msg: `invalid clinical status {VALUE}, must be one of [${clinicalStatusEnum}]`
    }
  },
  onsetDateTime: {
    type: Date,
    required: true
  },
  abatementDateTime: {
    type: Date
  },
  isVerified: Boolean,
  descriptors: [{
    type: Schema.Types.ObjectId,
    ref: 'Descriptor'
  }]
}, {
  timestamps: true,
  autoIndex: false,
  autoCreate: false,
  collection: 'ExpandedConditionView',
  toJSON: {
    versionKey: false,
    transform(doc, ret) {
      const conditionSummaryData = _.omit(ret, ['_id'])
      conditionSummaryData.id = ret._id
      return conditionSummaryData
    }
  }
})

module.exports = mongoose.model('ExpandedConditionView', ExpandedConditionViewSchema)
