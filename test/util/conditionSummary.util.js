'use strict'

const mongoose = require('mongoose')
const { chance } = require('../index')
const { CLINICAL_STATUS } = require('../../src/models/EHR/Condition.constants')

const clean = () => mongoose.model('ConditionSummary').deleteMany()

const generate = (attrs = {}) => {
  const defaultAttrs = {
    clinicalStatus: chance.pickone(Object.values(CLINICAL_STATUS)),
    onsetDateTime: chance.date(),
    type: mongoose.Types.ObjectId(),
    patient: mongoose.Types.ObjectId()
  }
  return Object.assign(defaultAttrs, attrs)
}

module.exports = {
  clean,
  generate,
  CLINICAL_STATUS
}
