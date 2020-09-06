'use strict'

const createSchema = require('./create')
const patchSchema = require('./patch')
const patientAccess = require('./patientAccess')

module.exports = {
  createSchema,
  patientAccess,
  patchSchema
}
