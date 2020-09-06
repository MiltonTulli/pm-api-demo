'use strict'

const mongoose = require('mongoose')

const clean = () => mongoose.model('MedicationStatement').deleteMany({})

module.exports = {
  clean
}
