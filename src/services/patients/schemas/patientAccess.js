'use strict'

const { objectId } = require('../../common/schemas')

const patientAccess = {
  params: {
    patientId: objectId().required()
  }
}

module.exports = patientAccess
