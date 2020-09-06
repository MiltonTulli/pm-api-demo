'use strict'

const _ = require('lodash')
const { Joi } = require('celebrate')
const { patientAccess } = require('../../schemas')
const { objectId } = require('../../../../common/schemas')

const create = {
  body: {
    type: objectId().required(),
    performedDateTime: Joi.date().optional(),
    descriptors: Joi.array().items(objectId()).unique(),
    performedPeriod: Joi.object({
      start: Joi.date().required(),
      end: Joi.date().min(Joi.ref('start')).optional()
    }).optional(),
    text: Joi.string()
  }
}

module.exports = _.merge({}, patientAccess, create)
