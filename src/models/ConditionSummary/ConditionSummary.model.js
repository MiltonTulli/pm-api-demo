'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')
const { CONDITON_SUMMARY_UNIQUE_PATIENT_CONDITION } = require('./ConditionSummary.constants')
const { CLINICAL_STATUS } = require('../EHR/Condition.constants')

const { Schema } = mongoose
const clinicalStatusEnum = Object.values(CLINICAL_STATUS)

const ConditionSummarySchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: 'Patient' },
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
  collection: 'ConditionSummary',
  toJSON: {
    versionKey: false,
    transform(doc, ret) {
      const conditionSummaryData = _.omit(ret, ['_id'])
      conditionSummaryData.id = ret._id
      return conditionSummaryData
    }
  }
})

ConditionSummarySchema.statics.removeAll = function removeAll(patientId) {
  const ConditionSummary = mongoose.model('ConditionSummary')
  return ConditionSummary.deleteMany({ patient: patientId })
}

ConditionSummarySchema.index({ patient: 1, type: 1 }, { unique: true, name: CONDITON_SUMMARY_UNIQUE_PATIENT_CONDITION }) // eslint-disable-line max-len
ConditionSummarySchema.index({ descriptors: 1 })

module.exports = mongoose.model('ConditionSummary', ConditionSummarySchema)
