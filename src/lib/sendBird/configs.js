'use strict'

const _ = require('lodash')

const {
  SENDBIRD_APP_ID,
  SENDBIRD_APP_TOKEN,
  SENDBIRD_TIMEOUT
} = process.env

module.exports = {
  appId: SENDBIRD_APP_ID,
  appToken: SENDBIRD_APP_TOKEN,
  timeout: _.defaultTo(parseInt(SENDBIRD_TIMEOUT, 10), 10000)
}
