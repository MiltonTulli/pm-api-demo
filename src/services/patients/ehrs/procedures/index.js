'use strict'

const { celebrate } = require('celebrate')
const { Router } = require('express')
const { create: createSchema } = require('./schemas')
const { create, patch, remove } = require('./handlers')
const { fetchPatient, patientBelongsToUser } = require('../../middlewares')
const { fetchProcedure } = require('./midlewares')

const router = Router({ mergeParams: true })

router.patch('/:procedureId',
  fetchPatient,
  patientBelongsToUser,
  fetchProcedure,
  patch)

router.patch('/:procedureId',
  fetchPatient,
  patientBelongsToUser,
  fetchProcedure,
  remove)

router.post('/', celebrate(createSchema), fetchPatient, patientBelongsToUser, create)

module.exports = router
