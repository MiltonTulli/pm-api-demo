'use strict'

const { Router } = require('express')
const { get, remove } = require('./handlers')

const router = Router()

router.get('/', get)
router.delete('/', remove)

module.exports = router
