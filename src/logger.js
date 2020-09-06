'use strict'

const { createLogger, transports } = require('winston')
const { logLevel } = require('./configs')

const logger = createLogger({
  level: logLevel,
  transports: [new transports.Console()]
})

module.exports = logger
