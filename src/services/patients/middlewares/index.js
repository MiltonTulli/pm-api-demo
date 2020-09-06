'use strict'

const fetchPatient = require('./fetchPatient')
const patientBelongsToUser = require('./patientBelongsToUser')
const canRefer = require('./canRefer')

module.exports = {
  fetchPatient,
  patientBelongsToUser,
  canRefer
}
