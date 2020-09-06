'use strict'

const _ = require('lodash')
const { Joi } = require('celebrate')
const { patientAccess } = require('../../schemas')

const find = {
  query: {
    resourceType: Joi.array().items(Joi.string().required()).unique()
  }
}

module.exports = _.merge({}, patientAccess, find)
