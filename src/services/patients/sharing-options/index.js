'use strict'

const { Router } = require('express')
const { celebrate } = require('celebrate')
const { fetchPatient, patientBelongsToUser } = require('../middlewares')
const { put: putSchema } = require('./schemas')
const { put: putShareOptions } = require('./handlers')

const router = Router({ mergeParams: true })

router.put('/',
  celebrate(putSchema),
  fetchPatient,
  patientBelongsToUser,
  putShareOptions)

module.exports = router
