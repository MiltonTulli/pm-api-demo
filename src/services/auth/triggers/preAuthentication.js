'use strict'

const mongoose = require('mongoose')
const debug = require('debug')('services:auth:triggers:preAuthentication')
const db = require('../../../db')

let mongoDBConnection = null
/* eslint-disable no-param-reassign */
module.exports.handler = async (event, context, callback) => {
  // Allow to reuse mongoDBConnection between function calls.
  context.callbackWaitsForEmptyEventLoop = false
  // Connect to MongoDB if not already connected.
  if (mongoDBConnection === null) {
    mongoDBConnection = await db.connect({
      // Disable mongoose and MongoDB driver buffering
      // in order to fail fast if not connected.
      bufferCommands: false,
      bufferMaxEntries: 0
    })
  }
  const { email } = event.request.userAttributes
  debug(`Finding user with email = ${email}, from preAuthentication `)
  const User = mongoose.model('User')
  const user = await User.findOne({ email })
  if (!user) {
    callback(new Error(`User with email ${email} not found`))
  } else {
    callback(null, event)
  }
}
