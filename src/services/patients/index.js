'use strict'

const { Router } = require('express')
const { celebrate } = require('celebrate')
const { createSchema, patchSchema } = require('./schemas')
const { create, patch, get } = require('./handlers')
const { patientBelongsToUser, fetchPatient, canRefer } = require('./middlewares')
const ehrProviders = require('./ehr-providers')
const conditions = require('./conditions')
const ehrs = require('./ehrs')
const validatePatient = require('./validate')
const sharingOptions = require('./sharing-options')
const peers = require('./peers')

const router = Router({ mergeParams: true })

router.post('/', celebrate(createSchema), create) // eslint-disable-next-line max-len
router.patch('/:patientId', celebrate(patchSchema), fetchPatient, patientBelongsToUser, canRefer, patch)
router.get('/:patientId', fetchPatient, get)
router.use('/:patientId/ehr-providers', ehrProviders)
router.use('/:patientId/conditions', conditions)
router.use('/:patientId/ehrs', ehrs)
router.use('/:patientId/validate', validatePatient)
router.use('/:patientId/sharing-options', sharingOptions)
router.use('/:patientId/peers', peers)

module.exports = router
