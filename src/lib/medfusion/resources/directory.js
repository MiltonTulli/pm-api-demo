'use strict'

const { apiV1 } = require('../api')

const serviceUrl = '/users'

const getOffice = async ({
  userUuid,
  userAccessToken,
  officeId
}) => {
  const headers = { Authorization: `Bearer ${userAccessToken}` }
  const { data } = await apiV1.get(`${serviceUrl}/${userUuid}/offices/${officeId}`, { headers }) // eslint-disable-line max-len
  return data
}

const getFacility = async ({
  userUuid,
  userAccessToken,
  facilityId
}) => {
  const headers = { Authorization: `Bearer ${userAccessToken}` }
  const { data } = await apiV1.get(`${serviceUrl}/${userUuid}/facilities/${facilityId}`, { headers }) // eslint-disable-line max-len
  return data
}

module.exports = {
  office: {
    retrieve: getOffice
  },
  facility: {
    retrieve: getFacility
  }
}
