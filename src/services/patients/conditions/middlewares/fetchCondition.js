'use strict'

const httpErrors = require('http-errors')

const fetchCondition = async (req, res, next) => {
  const { conditionId } = req.params
  const { patient } = req.locals

  try {
    const conditionSummary = await patient.findOneCondition({ _id: conditionId })
    if (!conditionSummary) {
      next(new httpErrors.NotFound(`Condition summary ${conditionId} Not found`))
    } else {
      req.locals.conditionSummary = conditionSummary
      next()
    }
  } catch (error) {
    next(error)
  }
}

module.exports = fetchCondition
