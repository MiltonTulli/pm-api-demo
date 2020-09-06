'use strict'

/**
 * This module is inteded for parse aws arns into options
 * For mor information check the aws site:
 * https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html
 */

module.exports.parseCognitoArn = (cognitoArn) => {
  // cognito user pool arn format arn:partition:service:region:account-id:resourcetype/resource
  const [arnFirstPart, resource] = cognitoArn.split('/')

  if (!resource) throw new Error('Invalid Cognito ARN missing resource')
  
  const [
    arn,
    partition,
    service,
    region,
    accountId,
    resourceType
  ] = arnFirstPart.split(':')

  return {
    arn,
    partition,
    service,
    region,
    accountId,
    resourceType,
    resource
  }
}
