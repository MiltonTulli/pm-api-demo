'use strict'

const crypto = require('crypto')
const { intercomIdentifyVerificationSecret: secret } = require('../../configs')

const createHash = (value) => {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(value)
  return hmac.digest('hex')
}

module.exports = {
  createHash
}
