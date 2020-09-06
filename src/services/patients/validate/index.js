'use strict'

const { Router } = require('express')
const { celebrate } = require('celebrate')
const { fetchPatient, patientBelongsToUser } = require('../middlewares')
const { validate: validateSchema } = require('./schemas')
const { validate: validatePatient } = require('./handlers')

const router = Router({ mergeParams: true })

router.post('/',
  celebrate(validateSchema),
  fetchPatient,
  patientBelongsToUser,
  validatePatient)

module.exports = router
