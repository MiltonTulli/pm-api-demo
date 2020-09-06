'use strict'

const mongoose = require('mongoose')
const MedfusionSchema = require('./Medfusion.schema')

const { Schema } = mongoose

const EHRProvidersSchema = new Schema({
  medfusion: MedfusionSchema
}, {
  _id: false
})

module.exports = EHRProvidersSchema
