'use strict'

const mongoose = require('mongoose')
const { chance } = require('../index')

const clean = () => mongoose.model('Descriptor').deleteMany()

const generate = (attrs = {}) => {
  const defaultAttrs = {
    parents: [],
    label: chance.sentence(),
    name: chance.word(),
    type: chance.word(),
    description: chance.sentence()
  }
  return Object.assign(defaultAttrs, attrs)
}

module.exports = {
  clean,
  generate
}
