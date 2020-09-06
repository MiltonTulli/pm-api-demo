'use strict'

const cors = require('cors')
const { corsAllowedDomains } = require('../../configs')
const originVerifier = require('./originVerifier')

const options = {
  origin: originVerifier(corsAllowedDomains),
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600,
  optionsSuccessStatus: 200
}

module.exports = cors(options)
