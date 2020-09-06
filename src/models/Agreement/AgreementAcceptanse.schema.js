'use strict'

const mongoose = require('mongoose')

const { Schema } = mongoose
const AgreementAcceptanceSchema = new Schema({
  agreement: {
    type: Schema.Types.ObjectId,
    ref: 'Agreement'
  },
  acceptanceDate: {
    type: Date,
    required: [true, 'Acceptance date is required'],
    default: Date.now,
    validate: [{
      validator(val) {
        const now = new Date().getTime()
        const aDate = new Date(val).getTime()
        const oneHour = 3600000
        return aDate >= now - oneHour && aDate < now + oneHour
      },
      msg: 'Invalid acceptanse date'
    }]
  }
}, {
  timestamps: true,
  _id: false
})

module.exports = AgreementAcceptanceSchema
