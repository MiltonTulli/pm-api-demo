'use strict'

const mongoose = require('mongoose')
const debug = require('debug')('services:patients:middlewares:fetchPatient')

const fetchPatient = async (req, res, next) => {
  const { patientId } = req.params
  const Patient = mongoose.model('Patient')
  debug(`Fetching patient ${patientId}`)
  const patient = await Patient.findById(patientId).populate('portals').exec()
  req.locals.patient = patient
  next()
}

module.exports = fetchPatient
