'use strict'

const { Router } = require('express')
const { connections, sync } = require('./handlers')

const router = Router({ mergeParams: true })

router.get('/connections', connections)
router.post('/sync', sync)

module.exports = router
