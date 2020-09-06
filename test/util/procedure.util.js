'use strict'

const mongoose = require('mongoose')
const { chance } = require('../index')

const clean = () => mongoose.model('ConditionSummary').deleteMany()

const generate = (attrs = {}) => {
  const defaultAttrs = {
    type: mongoose.Types.ObjectId(),
    descriptors: [mongoose.Types.ObjectId()],
    text: 'Opcional',
    performedDateTime: chance.date()
  }
  return Object.assign(defaultAttrs, attrs)
}

module.exports = {
  clean,
  generate
}
