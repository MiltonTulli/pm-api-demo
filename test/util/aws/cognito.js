'use strict'

const jwt = require('jsonwebtoken')
const { keys } = require('./cognitoKeys')
const { chance } = require('../../index')
const { cognitoUserPoolArn } = require('../../../src/configs')
const { parseCognitoArn } = require('../../../src/lib/aws/arn')

const cognitoAttrs = parseCognitoArn(cognitoUserPoolArn)
const iss = `https://cognito-idp.${cognitoAttrs.region}.amazonaws.com/${cognitoAttrs.resource}`

const signToken = (payload) => {
  const defaultAttrs = {
    sub: chance.guid({ version: 4 }),
    email: chance.email(),
    email_verified: chance.bool(),
    event_id: chance.guid({ version: 4 }),
    iss,
    'cognito:username': chance.guid(),
    token_use: 'id'
  }
  const key = chance.pickone(keys)
  return jwt.sign(
    { ...defaultAttrs, ...payload },
    key.private,
    {
      algorithm: 'RS256',
      header: { kid: key.id }
    }
  )
}

module.exports = {
  signToken
}
