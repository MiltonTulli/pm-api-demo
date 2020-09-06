'use strict'

const axios = require('axios')
const debug = require('debug')('lib:captcha:captchaValidator')
const { captchaSecretKey, googleUrl, recaptchaValidationUrlPath } = require('../../configs')

const API = axios.create({
  baseURL: googleUrl,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' }
})

/**
 * This method verifies recaptcha token received.
 * @param {String} token -
 * e.g 'T0K3Naosd-1238d8fu8sd9jnk13./1232342sdfdfg-.45'
 * @return {Promise} return a promise that fullfill with a
 * Boolean indicating if token is valid, or reject with corresponding error
 */

module.exports = async (token) => {
  debug(`Token to validate => ${token}`)

  if (!token) return false

  try {
    const url = `${recaptchaValidationUrlPath}?secret=${captchaSecretKey}&response=${token}`
    const { data } = await API.post(url)
    debug('Token validation result = %O', data)
    return data.success
  } catch (err) {
    debug('Error with token validation api post', err)
    return false
  }
}
