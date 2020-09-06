'use strict'

const patch = async (req, res, next) => {
  const { conditionSummary } = req.locals
  const { body: conditionSummaryPatch } = req

  try {
    await conditionSummary.updateOne(conditionSummaryPatch)
    res.json()
  } catch (error) {
    next(error)
  }
}

module.exports = patch
