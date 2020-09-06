'use strict'

const axios = require('axios')
const configs = require('./configs')

const api = axios.create({
  baseURL: `https://api-${configs.appId}.sendbird.com/v3/`,
  timeout: configs.timeout,
  headers: {
    'Api-Token': configs.appToken,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

module.exports = {
  createUser: userData => api.post('/users', userData),
  updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
  retrieveUser: userId => api.get(`/users/${userId}`)
}
