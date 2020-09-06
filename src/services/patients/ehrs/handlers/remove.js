'use strict'

const mongoose = require('mongoose')

const remove = async (req, res, next) => {
  const { ehr } = req.locals

  try {
    await mongoose.model('EHR').deleteOne({ _id: ehr._id })
    res.json()
  } catch (error) {
    next(error)
  }
}

module.exports = remove
