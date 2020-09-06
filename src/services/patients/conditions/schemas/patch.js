'use strict'

const _ = require('lodash')
const { Joi } = require('celebrate')
const conditionAccess = require('./conditionAccess')
const { objectId } = require('../../../common/schemas')
const { CLINICAL_STATUS } = require('../../../../models/EHR/Condition.constants')

const validClinicalStatus = Object.keys(CLINICAL_STATUS)

const patch = {
  body: {
    clinicalStatus: Joi.string().allow(validClinicalStatus),
    abatementDateTime: Joi.date(),
    onsetDateTime: Joi.date(),
    descriptors: Joi.array().items(objectId()).unique()
  }
}

module.exports = _.merge({}, conditionAccess, patch)
