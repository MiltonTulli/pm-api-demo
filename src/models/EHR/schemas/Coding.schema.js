'use strict'

const { Schema } = require('mongoose')

const CodingSchema = new Schema({
  system: String,
  code: String,
  display: String
}, {
  _id: false
})

module.exports = CodingSchema
