'use strict'

const mongoose = require('mongoose')
const appDB = require('../src/db')

module.exports = {
  async up() {
    await appDB.connect()
    const User = mongoose.model('User')
    await User.updateMany({}, { status: 'active' })
  },
  down() {}
}
