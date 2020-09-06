'use strict'

const mongoose = require('mongoose')
const validator = require('validator')
const moment = require('moment')
const {
  INVALID_EMAIL_ERROR_MSG,
  NAME_MINLENGTH,
  MINLENGTH_NAME_ERROR_MSG,
  NAME_MAXLENGTH,
  MAXLENGTH_NAME_ERROR_MSG,
  ALLOWABLE_MINUTE_DATE_RANGE,
  INVALID_DATE_ERROR_MSG
} = require('./Referral.constants')

const { Schema } = mongoose

const ReferralSchema = new Schema({
  email: {
    type: String,
    trim: true,
    validate: [validator.isEmail, INVALID_EMAIL_ERROR_MSG]
  },
  name: {
    type: String,
    trim: true,
    minlength: [NAME_MINLENGTH, MINLENGTH_NAME_ERROR_MSG],
    maxlength: [NAME_MAXLENGTH, MAXLENGTH_NAME_ERROR_MSG]
  },
  date: {
    type: Date,
    validate: [{
      validator(d) {
        return moment(d).isSameOrAfter(moment().subtract(ALLOWABLE_MINUTE_DATE_RANGE, 'm'))
      },
      msg: INVALID_DATE_ERROR_MSG
    }]
  },
  growSurfId: String
}, {
  _id: false
})

module.exports = ReferralSchema
