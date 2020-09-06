'use strict'

const _ = require('lodash')

const {
  NODE_ENV,
  PORT,
  LOG_LEVEL,
  MONGODB_URI,
  MONGODB_TEST_URI,
  MONGODB_HEALTHCHECK_COLLECTION,
  MONGOOSE_AUTO_INDEX,    
  CORS_ALLOWED_DOMAINS,
  AWS_COGNITO_USER_POOL_ARN,
  AWS_COGNITO_TOKEN_USE,
  AWS_COGNITO_TOKEN_EXPIRES_IN_MS,
  GOOGLE_CAPTCHA_SECRET_KEY,
  GOOGLE_URL,
  GOOGLE_RECAPTCHA_VALIDATION_URL_PATH,
  EXTRACTION_WORKER_SQS_URL,
  EXTRACTION_WORKER_URL,
  INTERCOM_IDENTIFY_VERIFICATION_SECRET,
  AWS_SES_REGION,
  REDIRECT_URL_AFTER_CONFIRM_USER
} = process.env

module.exports = {
  env: _.defaultTo(NODE_ENV, 'development'),
  port: _.defaultTo(parseInt(PORT, 10), 3000),
  logLevel: _.defaultTo(LOG_LEVEL, 'info'),
  mongoDBUri:
  NODE_ENV === 'test'
    ? _.defaultTo(MONGODB_TEST_URI, 'mongodb://mongodb:27017/test-pm')
    : _.defaultTo(MONGODB_URI, 'mongodb://mongodb:27017/pm'),
  mongoHealthcheckCollection: _.defaultTo(MONGODB_HEALTHCHECK_COLLECTION, 'healthTest'),
  mongooseAutoIndex: MONGOOSE_AUTO_INDEX === 'true',
  corsAllowedDomains: CORS_ALLOWED_DOMAINS ? _.map(_.split(CORS_ALLOWED_DOMAINS, ','), _.trim) : [],
  cognitoUserPoolArn: AWS_COGNITO_USER_POOL_ARN,
  cognitoTokenUse: _.defaultTo(AWS_COGNITO_TOKEN_USE, 'id'),
  cognitoTokenExpiresInMs: _.defaultTo(parseInt(AWS_COGNITO_TOKEN_EXPIRES_IN_MS, 10), 3600000),
  captchaSecretKey: GOOGLE_CAPTCHA_SECRET_KEY,
  googleUrl: GOOGLE_URL,
  recaptchaValidationUrlPath: GOOGLE_RECAPTCHA_VALIDATION_URL_PATH,
  sqsUrl: EXTRACTION_WORKER_SQS_URL,
  extractionWorkerUrl: EXTRACTION_WORKER_URL,
  intercomIdentifyVerificationSecret: INTERCOM_IDENTIFY_VERIFICATION_SECRET,
  awsSESRegion: _.defaultTo(AWS_SES_REGION, 'us-east-1'),
  redirectUrlAfterConfirmUser: REDIRECT_URL_AFTER_CONFIRM_USER
}
