'use strict'

const defaultTo = require('lodash/defaultTo')

const {
  MEDFUSION_CUSTOMER_UUID,
  MEDFUSION_CLIENT_ID,
  MEDFUSION_API_KEY,
  MEDFUSION_CLIENT_SECRET,
  MEDFUSION_API_URL,
  MEDFUSION_TIMEOUT
} = process.env

module.exports = {
  customerUuid: MEDFUSION_CUSTOMER_UUID,
  clientId: MEDFUSION_CLIENT_ID,
  apiKey: MEDFUSION_API_KEY,
  clientSecret: MEDFUSION_CLIENT_SECRET,
  apiUrl: MEDFUSION_API_URL,
  customerUrl: `customers/${MEDFUSION_CUSTOMER_UUID}`,
  timeout: parseInt(defaultTo(MEDFUSION_TIMEOUT, 10000), 10)
}
