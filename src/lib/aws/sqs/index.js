'use strict'

const axios = require('axios')
const debug = require('debug')('lib:aws:sqs')
const AWS = require('..')
const { extractionWorkerUrl } = require('../../../configs')

module.exports = (queueUrl) => {
  const sqs = new AWS.SQS({
    signatureVersion: 'v4',
    params: {
      QueueUrl: queueUrl
    }
  })

  /**
   * Sends a message to the specified queue.
   *
   * @param {Object} msgPayload: The message payload.
   * @param {Object} attributes: The message attributes.
   *
   * @returns {Promise} A promise that is resolved with a data
   * object if the message was sent successfully. In any other case
   * the promise will be rejected with the appropriate error.
   * */
  const send = async (message, attributes = {}) => {
    // TODO: clean this when we figure out how to link sqs with the worker locally
    if (extractionWorkerUrl) {
      debug(`Mocking message to ${extractionWorkerUrl}`, message, attributes.taskname.StringValue)
      const headers = {
        'x-aws-sqsd-taskname': attributes.taskname.StringValue,
        'x-aws-sqsd-attr-taskname': attributes.taskname.StringValue
      }
      return axios({
        method: 'post',
        url: extractionWorkerUrl,
        data: message,
        timeout: 10000,
        headers
      })
    }
    debug(`Sending message to queue ${queueUrl}: %O`, message)
    return sqs.sendMessage({
      MessageAttributes: attributes,
      MessageBody: JSON.stringify(message)
    }).promise()
  }

  return {
    send
  }
}
