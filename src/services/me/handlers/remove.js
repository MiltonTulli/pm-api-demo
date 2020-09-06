'use strict'

const httpStatus = require('http-status')
const mongoose = require('mongoose')

const remove = async (req, res, next) => {
  const { user } = req
  try {
    await mongoose.model('User').removeUser(user._id)
    res.sendStatus(httpStatus.NO_CONTENT)
  } catch (error) {
    next(error)
  }
}
module.exports = remove
