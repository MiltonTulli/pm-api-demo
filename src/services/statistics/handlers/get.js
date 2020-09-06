'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')

const get = async (req, res, next) => {
  try {
    // TODO: Create a view to hold conditions counter
    const Descriptor = mongoose.model('Descriptor')
    const ConditionSummary = mongoose.model('ExpandedConditionView')
    const conditions = await Descriptor.find({ type: 'condition' })
    const conditionFacet = _.map(conditions, condition => ({
      [condition.name]: [
        { $match: { type: condition._id, 'patient.isVerified': true } },
        { $count: 'total' }
      ]
    }))
    
    const aggregateResult = await ConditionSummary.aggregate([
      {
        $facet: _.transform(conditionFacet, (result, current) => Object.assign(result, current), {})
      }
    ])
    const summary = _.mapValues(
      _.get(aggregateResult, '[0]', {}),
      condition => _.get(condition, '[0]', { total: 0 })
    )
    res.json(summary)
  } catch (error) {
    next(error)
  }
}

module.exports = get
