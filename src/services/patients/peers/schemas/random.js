'use strict'

const _ = require('lodash')
const { Joi } = require('celebrate')
const { patientAccess } = require('../../schemas')

const random = {
  query: {
    n: Joi.number().default(1)
  }
}

module.exports = _.merge({}, patientAccess, random)
