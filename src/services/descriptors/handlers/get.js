'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')

const get = async (req, res, next) => {
  const { parentId, type, parentName } = req.query
  const Descriptor = mongoose.model('Descriptor')
  
  try {
    let query = { parents: parentId, type }
    if (parentName) {
      const parentNode = await Descriptor.findOne({ name: parentName })
      if (!parentNode) return res.json([])
      Object.assign(query, { parents: parentNode._id })
    }
    query = _.omitBy(query, _.isNil)
    const descriptors = await Descriptor.find(query).sort({ label: 1 }).exec()
    return res.json(descriptors)
  } catch (error) {
    return next(error)
  }
}

module.exports = get
