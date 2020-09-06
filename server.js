'use strict'

const { env, port } = require('./src/configs')
const logger = require('./src/logger')
const db = require('./src/db')
const app = require('./src/app')

/**
 * Performs all the required tasks in order to start the application.
 *
 * @returns {Promise} A promise that resolves with no value if
 * the bootstrap process was successful. Otherwise it is rejected
 * with the appropriate error.
 * */
const boot = async () => {
  logger.info(`Environment is: ${env}.`)

  // Connect to MongoDB.
  await db.connect()
  logger.info('Connected to MongoDB')

  // Start the server.
  app.listen(port, () => logger.info(`API Running on port ${port}.`))
}

// Boot the application.
boot()
  .catch(err => logger.error('Error while booting the application', err))
