'use strict'

const httpStatus = require('http-status')

const mongooseErrorHandler = (err, req, res, next) => {
  let statusCode

  if (err.code === 11000 || err.code === 11001) {
    statusCode = httpStatus.CONFLICT
    const collectionName = err.message.match(/collection: (.*) index: /)[1]
    const indexName = err.message.match(/index: (.*) dup key: /)[1]

    return res.status(statusCode).json({
      statusCode,
      name: httpStatus['409_NAME'],
      message: `Duplicate key error for index ${indexName} of collection ${collectionName}`
    })
  }

  if (['ValidationError', 'ValidatorError', 'CastError', 'VersionError'].includes(err.name)) {
    statusCode = httpStatus.BAD_REQUEST

    return res.status(statusCode).json({
      statusCode,
      name: httpStatus['400_NAME'],
      message: err.message
    })
  }

  // Not a mongoose error we want to handle.
  return next(err)
}

module.exports = mongooseErrorHandler
