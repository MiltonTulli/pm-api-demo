'use strict'

const jwt = require('jsonwebtoken')
const nock = require('nock')
const medfusion = require('../../src/lib/medfusion')
const { baseURL: medfusionBaseURL } = require('../../src/lib/medfusion/api')
const { chance } = require('../index')

/**
 * This function is used to mock a medfusion customer accessToken without
 * taking in consideration the signature.
 * @param {Object} payload - the payload to encode into the medfusion token
 * @param {Number} payload.expiresIn - the time this token will expires,
 * it defaults to 2 hours from now, you can privide string 60, "2 days", "10h", "7d"
 * @param {String} payload.client_id - the medfusion client_id,
 * it defaults to current medfusion config
 * @returns {String} returns a string representing the signed Json Web token
 */
const createCustomerAccessToken = ({
  expiresIn = '2h',
  client_id = medfusion.config.clientId,
  scope = []
} = {}) => jwt.sign({ client_id, scope }, 'SECRET_KEY', { expiresIn })


/*
{
  "customerUuid": "a263dd63-fa29-4669-b2c8-f3f6339ffc1a",
  "userUuid": "a31e52e0-9ddd-44df-82d1-adc593d4f1d5",
  "type": "com.medfusion.mfss.authentication.jwt.ApiCustomerUserJwtToken",
  "exp": 1550773623,
  "authId": "b7e15788f97540fab6b45919daebc778"
}
*/
const createUserAccessToken = ({
  customerUuid,
  userUuid,
  type = '',
  authId = '',
  expiresIn = '2h'
} = {}) => jwt.sign({
  customerUuid, userUuid, type, authId
}, 'SECRET_KEY', { expiresIn })

/* eslint-disable quote-props */
/**
 * @param {String} params.token - the token to be use as authorization
 * @param {Number} params.contentLeght - this match the request content length
 * defaults to 2
 * @returns {Object} return basic request header.
 */
const buildReqHeaders = ({ token }) => ({
  'authorization': `Bearer ${token}`,
  'content-type': 'application/json',
  'accept': 'application/json',
  'x-api-key': medfusion.config.apiKey,
  'user-agent': 'axios/0.18.0'
})
/* eslint-enable quote-props */

const nockCreateAccessToken = (customerAccessToken) => {
  // create nock for create customerAccessToken
  const response = {
    clientId: medfusion.config.clientId,
    clientSecret: '',
    token: customerAccessToken
  }

  const body = {
    clientId: medfusion.config.clientId,
    clientSecret: medfusion.config.clientSecret
  }

  const scope = nock(`${medfusionBaseURL('v1')}`)
    .persist(true)
    .post('/tokens', body)
    .reply(200, response)

  return scope
}

const nockCreateUser = (customerAccessToken, userUuid) => {
  const reqheaders = buildReqHeaders({ token: customerAccessToken })

  const scope = nock(`${medfusionBaseURL('v1')}`, { reqheaders })
    .persist(true)
    .post('/users', {})
    .reply(200, { uuid: userUuid })

  return scope
}

const nockCreateUserToken = (customerAccessToken, userUuid, userAccessToken) => {
  const reqheaders = buildReqHeaders({ token: customerAccessToken })

  const path = `/users/${userUuid}/tokens`
  const scope = nock(`${medfusionBaseURL('v1')}`, { reqheaders })
    .persist(true)
    .post(path)
    .reply(200, {
      accessToken: userAccessToken
    })
  return scope
}

const nockGetProfile = (userAccessToken, userUuid, profileId) => {
  const mockSuccessResponse = [
    {
      userUuid,
      name: 'me',
      zip: '',
      relationType: 'SELF',
      id: profileId,
      isSelf: true
    }
  ]

  /* eslint-disable quote-props */
  const reqheaders = {
    'authorization': `Bearer ${userAccessToken}`,
    'content-type': 'application/json',
    'accept': 'application/json',
    'x-api-key': medfusion.config.apiKey,
    'user-agent': 'axios/0.18.0'
  }
  /* eslint-disable quote-props */

  const path = `/users/${userUuid}/profiles`
  // create a nock scope
  const scope = nock(`${medfusionBaseURL('v1')}`, { reqheaders })
    .persist(true)
    .get(path)
    .reply(200, mockSuccessResponse)
  return scope
}

const buildResource = (profileId) => {
  const identifier = { identifier: [{ system: chance.word(), value: chance.word() }] }
  const contained = { contained: [{ id: chance.natural(), resourceType: chance.word() }] }
  const gender = { gender: chance.gender() }

  return {
    '@type': 'ldItemDetail',
    id: chance.hash(),
    type: chance.pickone(Object.values(medfusion.CONSTANTS.RESOURCE_TYPE)),
    createTime: chance.hammertime(),
    modifiedTime: chance.hammertime(),
    isArchived: chance.bool(),
    profileId,
    sourcePortalIds: chance.n(chance.natural, chance.natural({ min: 1, max: 5 })),
    sourceDocumentIds: chance.n(chance.hash, chance.natural({ min: 1, max: 5 })),
    data: {
      ...(chance.bool() && identifier),
      ...(chance.bool() && contained),
      ...(chance.bool() && gender),
      resourceType: chance.word()
    }
  }
}

const nockGetResources = (userAccessToken, userUuid, profileId, number) => {
  const mockSuccessResponse = chance.n(() => buildResource(profileId), number)
  /* eslint-disable quote-props */
  const reqheaders = {
    'authorization': `Bearer ${userAccessToken}`,
    'content-type': 'application/json',
    'accept': 'application/json',
    'x-api-key': medfusion.config.apiKey,
    'user-agent': 'axios/0.18.0'
  }
  /* eslint-disable quote-props */

  const path = `/users/${userUuid}/profiles/${profileId}/resources`
  // create a nock scope
  const scope = nock(`${medfusionBaseURL('v1')}`, { reqheaders })
    .persist(true)
    .get(path)
    .reply(200, mockSuccessResponse)
  return scope
}

const nockGetConnections = (
  userAccessToken,
  userUuid,
  profileId,
  mockSuccessResponse = [{ hasEverSucceeded: chance.bool() }]
) => {
  /* eslint-disable quote-props */
  const reqheaders = {
    'authorization': `Bearer ${userAccessToken}`,
    'content-type': 'application/json',
    'accept': 'application/json',
    'x-api-key': medfusion.config.apiKey,
    'user-agent': 'axios/0.18.0'
  }
  /* eslint-disable quote-props */

  const path = `/users/${userUuid}/profiles/${profileId}/connections`
  // create a nock scope
  const scope = nock(`${medfusionBaseURL('v2')}`, { reqheaders })
    .persist(true)
    .get(path)
    .reply(200, mockSuccessResponse)
  return scope
}

module.exports = {
  createCustomerAccessToken,
  createUserAccessToken,
  sandbox: {
    tokens: {
      create: nockCreateAccessToken
    },
    users: {
      create: nockCreateUser,
      createAccessToken: nockCreateUserToken,
      profiles: nockGetProfile,
      getResources: nockGetResources,
      connections: {
        list: nockGetConnections
      }
    }
  }
}
