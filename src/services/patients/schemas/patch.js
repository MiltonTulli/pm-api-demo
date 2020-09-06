'use strict'

const _ = require('lodash')
const { Joi } = require('celebrate')
const moment = require('moment')
const referralConstants = require('../../../models/Patient/schemas/Referral.constants')
const { GENDER } = require('../../../models/Patient/Patient.constants')
const humanNameSchema = require('./humanName')
const patientAccessSchema = require('./patientAccess')

const patch = {
  body: {
    names: Joi.array().items(humanNameSchema).optional().min(1),
    gender: Joi.string().valid(Object.values(GENDER)).optional(),
    birthDate: Joi.date().min('1-1-1900').less('now').optional(),
    referral: Joi.object().keys({
      email: Joi.string().email().optional(),
      name: Joi
        .string()
        .min(referralConstants.NAME_MINLENGTH)
        .max(referralConstants.NAME_MAXLENGTH)
        .optional(),
      date: Joi
        .date()
        .min(moment().subtract(referralConstants.ALLOWABLE_MINUTE_DATE_RANGE, 'm').toDate())
        .optional(),
      growSurfId: Joi.string().optional()
    })
  }
}

module.exports = _.merge({}, patientAccessSchema, patch)
