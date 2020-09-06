'use strict'

const serverless = require('serverless-http')
const app = require('./src/app')
const db = require('./src/db')

const slsHandler = serverless(app)
let mongoDBConnection = null

/* eslint-disable no-return-await, no-param-reassign */
module.exports.handler = async (event, context) => {
  // Allow to reuse mongoDBConnection between function calls.
  context.callbackWaitsForEmptyEventLoop = false

  // Connect to MongoDB if not already connected.
  if (mongoDBConnection === null || !mongoDBConnection.readyState) {
    mongoDBConnection = await db.connect({
      // Disable mongoose and MongoDB driver buffering
      // in order to fail fast if not connected.
      bufferCommands: false,
      bufferMaxEntries: 0
    })
  }

  return await slsHandler(event, context)
}
