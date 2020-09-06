'use strict'

const _ = require('lodash')
const { apiV1, apiV2 } = require('../api')

const serviceUrl = '/users'

/**
 * This function creates a medfusion user and return the received data from medfusion
 * @param {String} customerAccessToken - a valid medfusion customerAccessToken
 * @returns {Promise} returns a promise that resolve with the created medfusion user information
 * or reject with corresponding error
 */
const create = async (customerAccessToken) => {
  const headers = { Authorization: `Bearer ${customerAccessToken}` }
  const { data } = await apiV1.post(serviceUrl, {}, { headers })
  
  return data
}

/**
 * This function creates a user access token that could be used to interact
 * with medfusion in behalf of the user.
 * @param {String} params.userUuid - medfusion userUuid.
 * @param {String} params.customerAccessToken - medfusion customerAccessToken.
 * @returns {Promise} returns a promise that fullfill with a user accessToken information or
 * reject with corresponding error
 */
const createAccessToken = async ({ userUuid, customerAccessToken }) => {
  const headers = { Authorization: `Bearer ${customerAccessToken}` }
  const { data } = await apiV1.post(`${serviceUrl}/${userUuid}/tokens`, {}, { headers })
  
  return data
}

/**
 * This function returns all the medfusion profiles of an specific user
 * @param {Object} params - the params to use to perform the query
 * @param {String} params.userUuid - medfusion userUuid
 * @param {String} params.userAccessToken - medfusion userAccesToken
 * @returns {Promise} returns a promise that fullfill with the user profiles or
 * reject with corresponding errors
 */
const profiles = async ({ userUuid, userAccessToken }) => {
  const headers = { Authorization: `Bearer ${userAccessToken}` }
  const { data } = await apiV1.get(`${serviceUrl}/${userUuid}/profiles`, { headers })

  return data
}

/**
 * This function returns the liveDocs for an specific user/profile within
 * medfusion
 * @param {Object} params - the params to use to perform the query
 * @param {String} params.userUuid - medfusion userUuid
 * @param {String} params.userAccessToken - medfusion userAccesToken
 * @param {String} params.profileId - the user profileId
 * @param {String} params.sinceDate - ISO-8601 timestamp to limit results to live doc items
 * created since the time specified. Format should be yyy-MM-ddTHH:mm:ssZ
 * @param {String} params.resourceType - the desired resource type pick from
 * medfusion.CONSTANTS.RESOURCE_TYPE
 * @returns {Promise} returns a promise that fullfill with the user profiles or
 * reject with corresponding errors
 */
const listResources = async ({
  userUuid,
  userAccessToken,
  profileId,
  resourceType,
  sinceDate
}) => {
  const headers = { Authorization: `Bearer ${userAccessToken}` }
  const params = _.pickBy({
    resourceType,
    sinceDate
  }, _.identity)
  const { data } = await apiV1.get(`${serviceUrl}/${userUuid}/profiles/${profileId}/resources`, { headers, params }) // eslint-disable-line max-len
  return data
}

/**
 * This function return an especific liveDoc from a user/profile within
 * medfusion
 * @param {Object} params - the params to use to perform the query
 * @param {String} params.userUuid - medfusion userUuid
 * @param {String} params.userAccessToken - medfusion userAccesToken
 * @param {String} params.profileId - the user profileId
 * @param {String} params.resourceId - the liveDoc id
 * @returns {Promise} returns a promise that fullfill with the resource or
 * reject with corresponding errors
 */
const findOneResource = async ({
  userUuid,
  userAccessToken,
  profileId,
  resourceId
}) => {
  const headers = { Authorization: `Bearer ${userAccessToken}` }
  const { data } = await apiV1.get(`${serviceUrl}/${userUuid}/profiles/${profileId}/resources/${resourceId}`, { headers }) // eslint-disable-line max-len
  return data
}

/**
 * This function returns the connections for an specific user within
 * medfusion
 * @param {Object} params - the params to use to perform the query
 * @param {String} params.userUuid - medfusion userUuid
 * @param {String} params.userAccessToken - medfusion userAccesToken
 * @param {[String]} params.resourceTypes - array of the desired resource types pick from
 * medfusion.CONSTANTS.RESOURCE_TYPE
 * @returns {Promise} returns a promise that fullfill with the user profiles or
 * reject with corresponding errors
 */
const listConnections = async ({
  userUuid,
  profileId,
  userAccessToken
}) => {
  const headers = { Authorization: `Bearer ${userAccessToken}` }
  const { data } = await apiV2.get(`${serviceUrl}/${userUuid}/profiles/${profileId}/connections`, { headers }) // eslint-disable-line max-len
  return data
}

module.exports = {
  create,
  createAccessToken,
  profiles,
  connections: {
    list: listConnections
  },
  resources: {
    list: listResources,
    retrieve: findOneResource
  }
}
