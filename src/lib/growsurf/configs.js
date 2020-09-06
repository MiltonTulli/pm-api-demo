'use strict'

const _ = require('lodash')

const {
  GROWSURF_API,
  GROWSURF_CAMPAIGN_ID,
  GROWSURF_API_KEY,
  GROWSURF_TIMEOUT
} = process.env

module.exports = {
  apiUrl: GROWSURF_API,
  campaignId: GROWSURF_CAMPAIGN_ID,
  apiKey: GROWSURF_API_KEY,
  timeout: _.defaultTo(parseInt(GROWSURF_TIMEOUT, 10), 10000)
}
