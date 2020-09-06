'use strict'

const { Router } = require('express')
const { celebrate } = require('celebrate')
const { fetchPatient, patientBelongsToUser } = require('../middlewares')
const { random, list } = require('./handlers')
const { random: randomSchema, list: listSchema } = require('./schemas')

const router = Router({ mergeParams: true })

router.get('/', celebrate(listSchema), fetchPatient, patientBelongsToUser, list)
router.get('/random', celebrate(randomSchema), fetchPatient, patientBelongsToUser, random)

module.exports = router
