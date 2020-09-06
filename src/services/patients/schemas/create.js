'use strict'

const { Joi } = require('celebrate')
const { GENDER } = require('../../../models/Patient/Patient.constants')
const humanNameSchema = require('./humanName')

const create = {
  body: {
    names: Joi.array().items(humanNameSchema).required().min(1),
    gender: Joi.string().valid(Object.values(GENDER)).required(),
    birthDate: Joi.date().min('1-1-1900').less('now').required()
  }
}

module.exports = create
