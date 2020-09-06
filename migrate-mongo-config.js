'use strict'

const _ = require('lodash')

const {
  MONGODB_URI,
  MIGRATION_DATABASE_NAME,
  MIGRATION_CONNECT_TIMEOUTMS,
  MIGRATION_SOCKET_TIMEOUTMS
} = process.env

const config = {
  mongodb: {
    url: MONGODB_URI,
    databaseName: _.defaultTo(MIGRATION_DATABASE_NAME, 'peermedical'),
    options: {
      useNewUrlParser: true,
      connectTimeoutMS: _.defaultTo(parseInt(MIGRATION_CONNECT_TIMEOUTMS, 10), 30000),
      socketTimeoutMS: _.defaultTo(parseInt(MIGRATION_SOCKET_TIMEOUTMS, 10), 30000)
    }
  },
  changelogCollectionName: 'changelog',
  migrationsDir: 'migrations'
}

module.exports = config
