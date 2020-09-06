'use strict'

const celebrateErrorHandler = require('./celebrateErrorHandler')
const mongooseErrorHandler = require('./mongooseErrorHandler')
const httpErrorHandler = require('./httpErrorHandler')

module.exports = {
  celebrateErrorHandler,
  mongooseErrorHandler,
  httpErrorHandler
}
