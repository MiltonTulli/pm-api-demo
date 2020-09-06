'use strict'

const { expect } = require('../../index')
const { parseCognitoArn } = require('../../../src/lib/aws/arn')

describe('AWS ARN parser', () => {
  describe('Cognito ARN parser', () => {
    it('Should parse a valid cognito arn', () => {
      const cognitoArn = 'arn:aws:cognito-idp:us-east-2:115064490138:userpool/us-east-2_ALbzNBskk'
      const {
        region,
        resource,
        service,
        accountId
      } = parseCognitoArn(cognitoArn)

      expect(accountId).to.equal('115064490138')
      expect(region).to.equal('us-east-2')
      expect(resource).to.equal('us-east-2_ALbzNBskk')
      expect(service).to.equal('cognito-idp')
    })
  })
})
