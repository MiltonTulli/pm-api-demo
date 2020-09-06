'use strict'

const httpStatus = require('http-status')
const { isCelebrate } = require('celebrate')

const celebrateErrorHandler = (err, req, res, next) => {
  if (!isCelebrate(err)) return next(err)

  const statusCode = httpStatus.BAD_REQUEST

  return res.status(statusCode).json({
    statusCode,
    name: httpStatus['400_NAME'],
    message: err.message
  })
}

module.exports = celebrateErrorHandler
