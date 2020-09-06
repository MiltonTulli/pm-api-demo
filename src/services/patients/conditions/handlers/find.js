'use strict'

const find = async (req, res, next) => {
  const { patient } = req.locals
  
  try {
    const conditions = await patient.findConditions({})
      .populate('descriptors')
      .populate('type')
      .exec()
    res.json(conditions)
  } catch (error) {
    next(error)
  }
}

module.exports = find
