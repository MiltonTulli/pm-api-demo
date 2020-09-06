'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')
const Promise = require('bluebird')
const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiAsPromised = require('chai-as-promised')
const Chance = require('chance')
const httpStatus = require('http-status')

const nock = require('nock')
const { cognitoUserPoolArn } = require('../src/configs')
const { parseCognitoArn } = require('../src/lib/aws/arn')
const { jwks } = require('./util/aws/cognitoKeys')

const cognitoAttrs = parseCognitoArn(cognitoUserPoolArn)
nock(`https://cognito-idp.${cognitoAttrs.region}.amazonaws.com/${cognitoAttrs.resource}`)
  .get('/.well-known/jwks.json')
  .reply(200, { keys: jwks })

const app = require('../src/app')
const extractionWorker = require('../src/jobs/extractPatientEHRs/app')

const db = require('../src/db')

chai.use(chaiHttp)
chai.use(chaiAsPromised)

/**
 * Performs all the operations needed to bootstrap the application.
 *
 * @returns {Promise} A promise that is fulfilled if all the operations
 * succeeded.
 * */
const boot = async () => {
  await db.connect()
}

/**
 * Check if model belongs to a collection
 */
const isCollection = modelName => !modelName.endsWith('View')

/**
 * Removes all documents from every MongoDB collection.
 *
 * @returns {Promise} A promise that is fulfilled if all documents from
 * all collections could be removed.
 * */
const cleanDB = async () => Promise.map(
  _.filter(mongoose.modelNames(), isCollection),
  async modelName => mongoose.model(modelName).deleteMany({})
)

module.exports = {
  boot,
  cleanDB,
  app,
  extractionWorker,
  expect: chai.expect,
  request: chai.request,
  httpStatus,
  chance: new Chance()
}
