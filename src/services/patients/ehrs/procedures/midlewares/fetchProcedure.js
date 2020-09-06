'use strict'

const fetchProcedure = async (req, res, next) => {
  const { patient } = req.locals
  const { procedureId } = req.params

  try {
    const procedure = await patient.findOneProcedure({ _id: procedureId })
    req.locals.procedure = procedure
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = fetchProcedure
