'use strict'

const Promise = require('bluebird')
const mongoose = require('mongoose')
const appDB = require('../src/db')
const { createHash } = require('../src/lib/intercom')

const updateUser = async (user) => {
  // eslint-disable-next-line no-param-reassign
  await user.updateOne({ intercomHash: createHash(user.email) })
}

module.exports = {
  async up() {
    await appDB.connect()
    const User = mongoose.model('User')
    console.log('Adding user  intercom_hash')
    const users = await User.find({})
    await Promise.map(users, updateUser)
    console.log('Users updated')
  },
  down() {}
}
