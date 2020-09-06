'use strict'

const AWS = require('aws-sdk')

AWS.config.apiVersions = {
  sqs: '2012-11-05'
}

module.exports = AWS
