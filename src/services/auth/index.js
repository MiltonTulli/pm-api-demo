'use strict'

const { Router } = require('express')
const _ = require('lodash')
const AWS = require('aws-sdk')
const httpStatus = require('http-status')

const configs = require('../../configs')

AWS.config.setPromisesDependency(require('bluebird'))

const CognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
  //   apiVersion: '2016-04-18',
  region: configs.awsSESRegion
})

const router = Router()

const get = (req, res) => {
  const params = {
    ClientId: _.get(req.query, 'client_id'),
    ConfirmationCode: _.get(req.query, 'confirmation_code'),
    Username: _.get(req.query, 'user_name')
  }

  const confirmSignUp = CognitoIdentityServiceProvider.confirmSignUp(params).promise()
  const statusCode = httpStatus.SEE_OTHER

  confirmSignUp
    .then((data) => {
      const redirectUrl = configs.redirectUrlAfterConfirmUser
      console.log(data)
      res.redirect(statusCode, redirectUrl)
    })
    .catch((error) => {
      res.json({ ...params, error })
    })
}

router.get('/', get)

module.exports = router
