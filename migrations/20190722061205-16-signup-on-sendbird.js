'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const mongoose = require('mongoose')
const appDB = require('../src/db')
const { createUser, updateUser } = require('../src/lib/sendBird')

const createSendBirdUser = async (user) => {
  // eslint-disable-next-line no-param-reassign
  const nickname = `LC${_.toUpper(user.id.substr(-6))}`
  try {
    await createUser({ user_id: user.id, nickname, profile_url: '' })
  } catch (error) {
    const errorCode = _.get(error, 'response.data.code')
    if (errorCode === 400202) {
      console.log('User Already exists Updating')
      await updateUser(user.id, { nickname })
      return
    }
    throw error
  }
}

module.exports = {
  async up() {
    await appDB.connect()
    const User = mongoose.model('User')
    console.log('Creating Sendbird Users')
    const users = await User.find({ accountType: 'partner' })
    await Promise.map(users, createSendBirdUser, { concurrency: 1 }) // otherwise we get banned
    console.log('Users updated')
  },
  down() {}
}
