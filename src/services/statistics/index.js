'use strict'

const { Router } = require('express')
const { lungCancer, get } = require('./handlers')
const { authenticate } = require('../auth/middlewares')

const router = Router({ mergeParams: true })

router.get('/', get)
router.get('/lung-cancer', authenticate, lungCancer)

module.exports = router
