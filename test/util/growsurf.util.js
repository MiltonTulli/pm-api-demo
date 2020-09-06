'use strict'

const nock = require('nock')
const httpStatus = require('http-status')
const { chance } = require('../index')
const { apiKey, apiUrl, campaignId } = require('../../src/lib/growsurf/configs')
    
const URL = `${apiUrl}/campaign/${campaignId}`

const buildDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: `Bearer ${apiKey}`
})

const mockSuccessResponse = (participant) => {
  const id = chance.word({ length: 6 })
  const email = chance.email()
  const defaultBody = {
    id,
    firstName: chance.name(),
    lastName: chance.last(),
    shareUrl: `https://hoolie.com?grsf=${id}`,
    email
  }
  const body = Object.assign(defaultBody, participant)
  const status = httpStatus.OK
  return { status, body }
}

const addParticipant = (req, res) => nock(URL, { reqheaders: buildDefaultHeaders() })
  .post('/participant', req.body)
  .reply(res.status, res.body)

const triggerReferral = () => {}

module.exports = {
  mockSuccessResponse,
  addParticipant,
  triggerReferral
}
