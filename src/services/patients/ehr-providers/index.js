'use strict'

const { Router } = require('express')
const { celebrate } = require('celebrate')
const { create } = require('./handlers')
const medfusion = require('./medfusion')
const { create: createSchema } = require('./schemas')
const { fetchPatient, patientBelongsToUser } = require('../middlewares')

const router = Router({ mergeParams: true })

router.post('/:provider', celebrate(createSchema), fetchPatient, patientBelongsToUser, create)
router.use('/medfusion', fetchPatient, patientBelongsToUser, medfusion)

module.exports = router
