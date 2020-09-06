'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')
const httpErrors = require('http-errors')

const checkConditionDescriptors = async (req, res, next) => {
  const { type: conditionTypeId, descriptors } = req.body

  try {
    const root = await mongoose.model('Descriptor').findOne({ _id: conditionTypeId })
    const validDescriptors = await root.filterDescriptors(descriptors)
    const validDescriptorsIds = _.map(validDescriptors, vd => vd._id.toString())

    if (!validDescriptorsIds.length || _.difference(descriptors, validDescriptorsIds).length) {
      next(new httpErrors.BadRequest('Invalid Descriptors'))
    } else {
      next()
    }
  } catch (error) {
    next(error)
  }
}

module.exports = checkConditionDescriptors
