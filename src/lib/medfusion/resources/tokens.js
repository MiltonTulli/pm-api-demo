'use strict'

const _ = require('lodash')
const config = require('../config')
const { apiV1 } = require('../api')

const serviceUrl = '/tokens'

/**
 * This function create a medfusions customer AccessToken it uses current environment
 * MEDFUSION_CLIENT_ID and MEDFUSION_CLIENT_SECRET
 * @returns {Promise} returns a promise that fullfill with customer access token or
 * reject with corresponding error
 */
const createCustomerAccessToken = async () => {
  const { data } = await apiV1.post(serviceUrl, _.pick(config, ['clientId', 'clientSecret']))
  return data
}

module.exports = {
  createCustomerAccessToken
}
