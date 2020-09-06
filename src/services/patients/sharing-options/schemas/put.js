'use strict'

const _ = require('lodash')
const { Joi } = require('celebrate')
const { patientAccess } = require('../../schemas')

const put = {
  body: {
    shareInAggregate: Joi.boolean().required(),
    shareIndividually: Joi.boolean().required(),
    connect: Joi.boolean().required()
  }
}

module.exports = _.merge({}, patientAccess, put)
