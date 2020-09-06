'use strict'

const axios = require('axios')
const config = require('./config')

const baseURL = version => `${config.apiUrl}/${version}/${config.customerUrl}`

const apiV1 = axios.create({
  baseURL: baseURL('v1'),
  timeout: config.timeout,
  headers: {
    'x-api-key': config.apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

const apiV2 = axios.create({
  baseURL: baseURL('v2'),
  timeout: config.timeout,
  headers: {
    'x-api-key': config.apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

module.exports = {
  apiV1,
  apiV2,
  baseURL
}
