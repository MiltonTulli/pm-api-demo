'use strict'

const { Schema } = require('mongoose')
const CodingSchema = require('./Coding.schema')

const CodeableConceptSchema = new Schema({
  coding: [CodingSchema],
  text: { type: String, trim: true }
}, {
  _id: false
})

module.exports = CodeableConceptSchema
