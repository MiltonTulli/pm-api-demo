'use strict'

const debug = require('debug')('services:patients:middlewares:patientBelongsToUser')
const { Forbidden } = require('http-errors')

const patientBelongsToUser = (req, res, next) => {
  const { user } = req
  const { patient } = req.locals
  
  debug(`Checking if patient ${patient.id} belongs to user ${user.id}`)

  if (!user.hasPatient(patient.id)) {
    next(new Forbidden(`Patient ${patient.id} not within user ${user.id} patients`))
  } else {
    next()
  }
}

module.exports = patientBelongsToUser
