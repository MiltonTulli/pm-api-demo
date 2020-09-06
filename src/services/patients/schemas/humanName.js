'use strict'

const { Joi } = require('celebrate')
const {
  FAMILY_NAME_MAX_LENGTH,
  GIVEN_NAME_MAX_LENGTH,
  SUFFIX_NAME_MAX_LENGTH,
  PREFIX_NAME_MAX_LENGTH,
  USE_TYPE
} = require('../../../models/Patient/schemas/HumanName.constants')

const nameItemSchema = maxLength => Joi.array().items(Joi.string().trim().min(1).max(maxLength))

const humanName = {
  use: Joi.string().valid(Object.values(USE_TYPE)).required(),
  family: nameItemSchema(FAMILY_NAME_MAX_LENGTH).optional(),
  given: nameItemSchema(GIVEN_NAME_MAX_LENGTH).required(),
  suffix: nameItemSchema(SUFFIX_NAME_MAX_LENGTH).optional(),
  prefix: nameItemSchema(PREFIX_NAME_MAX_LENGTH).optional()
}

module.exports = humanName
