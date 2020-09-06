'use strict'

const _ = require('lodash')
const { Joi } = require('celebrate')
const { patientAccess } = require('../../schemas')
const { objectId } = require('../../../common/schemas')
const { CLINICAL_STATUS } = require('../../../../models/EHR/Condition.constants')

const validClinicalStatus = Object.values(CLINICAL_STATUS)

const create = {
  body: {
    type: objectId().required(),
    clinicalStatus: Joi.string().valid(validClinicalStatus).default(CLINICAL_STATUS.ACTIVE),
    abatementDateTime: Joi.date(),
    onsetDateTime: Joi.date().required(),
    descriptors: Joi.array().items(objectId()).unique()
  }
}

module.exports = _.merge({}, patientAccess, create)
