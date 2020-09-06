'use strict'

const { Router } = require('express')
const { celebrate } = require('celebrate')
const {
  create: createSchema,
  patch: patchSchema,
  find: findSchema,
  get: getSchema
} = require('./schemas')
const { filterDescriptors, fetchCondition } = require('./middlewares')
const {
  create,
  patch,
  find,
  get
} = require('./handlers')
const { fetchPatient, patientBelongsToUser } = require('../middlewares')

const router = Router({ mergeParams: true })
/* eslint-disable max-len */
router.post('/', celebrate(createSchema), fetchPatient, patientBelongsToUser, filterDescriptors, create)
router.patch('/:conditionId', celebrate(patchSchema), fetchPatient, patientBelongsToUser, fetchCondition, patch)
router.get('/:conditionId', celebrate(getSchema), fetchPatient, fetchCondition, get)
router.get('/', celebrate(findSchema), fetchPatient, find)
/* eslint-enable max-len */
module.exports = router
