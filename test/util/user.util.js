'use strict'

const mongoose = require('mongoose')
const { chance } = require('../index')
const { ROLES, STATUS } = require('../../src/models/User/User.constants')

const clean = () => mongoose.model('User').deleteMany()

const generate = (attrs = {}) => {
  const defaultAttrs = {
    email: chance.email(),
    firstName: chance.first(),
    lastName: chance.last(),
    roles: [chance.pickone(Object.values(ROLES))]
  }
  return Object.assign(defaultAttrs, attrs)
}

module.exports = {
  clean,
  generate,
  STATUS
}
