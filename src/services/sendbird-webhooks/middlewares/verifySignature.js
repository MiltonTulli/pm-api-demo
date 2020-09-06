'use strict'

const _ = require('lodash')
const crypto = require('crypto')
const { BadRequest } = require('http-errors')
const config = require('../../../configs')

const verifySignature = (req, res, next) => {
  const signature = _.get(req, 'headers["x-signature"]', '')
  const token = config.sendBirdAppToken
  const hash = crypto.createHmac('sha256', token)
    .update(req.rawBody)
    .digest('hex')
  return hash === signature ? next() : next(new BadRequest('Invalid Sendbird Signature'))
}
module.exports = verifySignature
