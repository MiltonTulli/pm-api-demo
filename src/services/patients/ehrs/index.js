'use strict'

const { Router } = require('express')
const procedures = require('./procedures')
const { find, remove } = require('./handlers')
const { fetchEhr } = require('./middlewares')
const { fetchPatient, patientBelongsToUser } = require('../middlewares')

const router = Router({ mergeParams: true })

router.use('/procedures', procedures)
router.get('/', fetchPatient, find)
router.delete('/:ehrId', fetchPatient, patientBelongsToUser, fetchEhr, remove)

module.exports = router
