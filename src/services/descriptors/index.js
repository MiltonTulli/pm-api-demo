'use strict'

const { Router } = require('express')
const { celebrate } = require('celebrate')
const { get } = require('./handlers')
const { get: getSchema } = require('./schemas')

const router = Router()

router.get('/', celebrate(getSchema), get)

module.exports = router
