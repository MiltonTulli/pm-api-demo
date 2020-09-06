'use strict'

const { Router } = require('express')
const { post } = require('./handlers')
const { verifySignature } = require('./middlewares')

const router = Router({ mergeParams: true })

router.post('/', verifySignature, post)

module.exports = router
