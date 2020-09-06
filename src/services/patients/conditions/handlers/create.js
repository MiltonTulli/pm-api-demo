'use strict'

const create = async (req, res, next) => {
  const { body: conditionSummaryData } = req
  const { patient } = req.locals

  try {
    const conditionSummary = await patient.createConditionSummary(conditionSummaryData)
    await conditionSummary
      .populate('descriptors')
      .populate('type')
      .execPopulate()
    res.json(conditionSummary)
  } catch (error) {
    next(error)
  }
}

module.exports = create
