'use strict'

const express = require('express')
const router = require('./services')

const app = express()

// Mount routes.
app.use('/', router)

module.exports = app
