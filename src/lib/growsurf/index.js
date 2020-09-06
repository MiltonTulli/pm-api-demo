'use strict'

const axios = require('axios')
const {
  apiUrl, campaignId, apiKey, timeout
} = require('./configs')

const API = axios.create({
  baseURL: `${apiUrl}/campaign/${campaignId}`,
  timeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}`
  }
})


module.exports = {
  addParticipant: participant => API.post('/participant', participant)
}
