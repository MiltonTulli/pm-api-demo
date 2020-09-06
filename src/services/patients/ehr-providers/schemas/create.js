'use strict'

const _ = require('lodash')
const { Joi } = require('celebrate')
const { patientAccess } = require('../../schemas')
const { PROVIDERS } = require('../../../../models/Patient/schemas/ehr-providers/EHRProviders.constants') // eslint-disable-line max-len

const allowedProviders = Object.values(_.omit(PROVIDERS, 'PEERMEDICAL'))

const create = {
  params: {
    provider: Joi.string().valid(allowedProviders).required()
  }
}

module.exports = _.merge({}, patientAccess, create)
