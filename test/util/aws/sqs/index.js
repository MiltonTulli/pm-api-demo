'use strict'

const nock = require('nock')
const crypto = require('crypto')
const _ = require('lodash')

const nockPostSQSMessage = (expectedMessage) => {
  const md5 = crypto
    .createHash('md5')
    .update(JSON.stringify(expectedMessage))
    .digest('hex')

  const XMLResponse = `<SendMessageResponse><SendMessageResult>
  <MD5OfMessageBody>${md5}</MD5OfMessageBody>
    <MessageId>MSGID</MessageId>
    </SendMessageResult></SendMessageResponse>`

  const scope = nock(`https://sqs.${process.env.AWS_REGION}.amazonaws.com:443`)
    .persist()
    .post('/', (body) => {
      const message = JSON.parse(body.MessageBody)
      return _.isEqual(message, expectedMessage)
    })
    .reply(200, XMLResponse)
  return scope
}

module.exports = {
  nockPostSQSMessage
}
