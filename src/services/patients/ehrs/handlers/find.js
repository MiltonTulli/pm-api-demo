'use strict'

const find = async (req, res, next) => {
  const { resourceType } = req.query
  const { patient } = req.locals

  try {
    const query = {}
    if (resourceType) Object.assign(query, { resourceType: { $in: resourceType } })
    const ehrs = await patient.findEHRs(query)
      .populate('type')
      .populate('descriptors')
      .exec()
    res.json(ehrs)
  } catch (error) {
    next(error)
  }
}

module.exports = find
