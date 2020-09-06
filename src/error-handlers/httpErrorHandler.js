'use strict'

const httpStatus = require('http-status')
const logger = require('../logger')

const httpErrorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR

  // Log the error if it is a 500.
  if (statusCode === httpStatus.INTERNAL_SERVER_ERROR) {
    logger.error(err.message, err.stack)
  }

  res.status(statusCode).json({
    statusCode,
    name: httpStatus[`${statusCode}_NAME`],
    message: err.expose ? err.message : httpStatus['500']
  })
}

module.exports = httpErrorHandler
