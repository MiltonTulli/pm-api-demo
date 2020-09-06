'use strict'

const _ = require('lodash')
const { objectId } = require('../../../common/schemas')
const { patientAccess } = require('../../schemas')

const conditionAccess = {
  params: {
    conditionId: objectId().required()
  }
}

module.exports = _.merge({}, patientAccess, conditionAccess)
