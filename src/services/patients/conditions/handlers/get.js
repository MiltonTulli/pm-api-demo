'use strict'

const get = async (req, res, next) => {
  const { conditionSummary } = req.locals
  
  try {
    await conditionSummary.populate('descriptors')
      .populate('type')
      .execPopulate()
    res.json(conditionSummary)
  } catch (error) {
    next(error)
  }
}

module.exports = get
