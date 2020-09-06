'use strict'

const CognitoExpress = require('cognito-express')
const HTTPErrors = require('http-errors')
const mongoose = require('mongoose')
const debug = require('debug')('services:auth:middlewares:authenticate')
const { cognitoUserPoolArn, cognitoTokenExpiresInMs, cognitoTokenUse } = require('../../../configs')
const { parseCognitoArn } = require('../../../lib/aws/arn')

// Initializing CognitoExpress constructor
const cognitoArnObj = parseCognitoArn(cognitoUserPoolArn)

const cognitoExpress = new CognitoExpress({
  region: cognitoArnObj.region,
  cognitoUserPoolId: cognitoArnObj.resource,
  tokenUse: cognitoTokenUse,
  tokenExpiration: cognitoTokenExpiresInMs
})

const cognitoExpressValidatePromise = token => new Promise((resolve) => {
  cognitoExpress.validate(token, (err, response) => resolve({ err, response }))
})

module.exports = async (req, res, next) => {
  const User = mongoose.model('User')
  // Check the Authorization header was sent.
  const authorization = req.get('Authorization')
  if (!authorization) return next(new HTTPErrors.Unauthorized('Missing authorization header'))
 
  // Check the Authorization header has two parts.
  const authorizationParts = authorization.split(' ')
  if (authorizationParts.length !== 2) return next(new HTTPErrors.Unauthorized('Invalid authorization header')) // eslint-disable-line max-len
 
  // Check that token type is Bearer and a token was sent.
  const [tokenType, token] = authorizationParts
  if (tokenType !== 'Bearer') return next(new HTTPErrors.Unauthorized('Invalid token type'))
  if (!token) return next(new HTTPErrors.Unauthorized('Missing bearer token'))

  try {
    debug('Validating token')
    const { err: validateError, response } = await cognitoExpressValidatePromise(token)
    if (validateError) return next(new HTTPErrors.Unauthorized(validateError))
    
    const { email } = response
    debug(`Finding user with email ${email}`)
    const user = await User.findOne({ email }).populate({
      path: 'patient',
      populate: { path: 'portals' }
    }).exec()
    if (!user) return next(new HTTPErrors.Unauthorized(`User with email ${email} not found`))
    debug(`User found ${user.id}`)
    req.user = user
    return next()
  } catch (error) {
    return next(error)
  }
}
