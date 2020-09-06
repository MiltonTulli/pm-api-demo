'use strict'

const debug = require('debug')('db:mongo')
const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
const { mongoDBUri, mongooseAutoIndex } = require('./configs')

// Load all models
require('require-all')({
  dirname: `${__dirname}/models`,
  filter: /\.model\.js$/
})

/**
 * Connect to MongoDB.
 *
 * @param {Object} opts: Options for this connection.
 *
 * @returns {Promise} A promise that resolves to the mongoose
 * default connection if the connection could be established.
 * Otherwise it will be rejected with the appropriate error.
 * */
const connect = async (opts = {}) => {
  const defaultOpts = {
    autoIndex: mongooseAutoIndex,
    useNewUrlParser: true,
    useCreateIndex: true
  }

  const options = Object.assign(defaultOpts, opts)
  debug('Connecting to MongoDB with options: %O', options)

  await mongoose.connect(mongoDBUri, options)
  debug('Connected to MongoDB successfully')

  return mongoose.connection
}

module.exports = {
  connect
}
