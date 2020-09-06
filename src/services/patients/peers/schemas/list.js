'use strict'

const _ = require('lodash')
const { Joi } = require('celebrate')
const { patientAccess } = require('../../schemas')
const { objectId } = require('../../../common/schemas')
const { PAGINATION_DEFAULT_LIMIT } = require('../constants')


const list = {
  query: {
    offset: Joi.number().min(0).default(0),
    limit: Joi.number().min(1).default(PAGINATION_DEFAULT_LIMIT),
    startAfter: objectId()
  }
}

module.exports = _.merge({}, patientAccess, list)
