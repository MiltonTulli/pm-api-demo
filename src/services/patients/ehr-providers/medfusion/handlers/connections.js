'use strict'

const _ = require('lodash')
const { PROVIDERS } = require('../../../../../models/Patient/schemas/ehr-providers/EHRProviders.constants') // eslint-disable-line max-len
const medfusion = require('../../../../../lib/medfusion')

const connections = async (req, res, next) => {
  const { patient } = req.locals
  const {
    userUuid,
    accessToken: userAccessToken,
    mainProfileId: profileId
  } = _.get(patient, `ehrProviders.${PROVIDERS.MEDFUSION}`)
  try {
    const userConnections = await medfusion.users.connections.list({ userUuid, profileId, userAccessToken }) // eslint-disable-line max-len
    res.json(userConnections)
  } catch (error) {
    next(error)
  }
}

module.exports = connections
