'use strict'

const create = async (req, res, next) => {
  const { body: procedureData } = req
  const { patient } = req.locals
  
  try {
    const procedure = await patient.createProcedure(procedureData)
    await procedure
      .populate('type')
      .populate('descriptors')
      .execPopulate()
    res.json(procedure)
  } catch (error) {
    next(error)
  }
}

module.exports = create
