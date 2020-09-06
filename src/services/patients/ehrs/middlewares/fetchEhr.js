'use strict'

const fetchEHR = async (req, res, next) => {
  const { patient } = req.locals
  const { ehrId } = req.params

  try {
    const ehr = await patient.findOneEHR({ _id: ehrId })
    if (ehr) {
      req.locals.ehr = ehr
      next()
    } else {
      res.json()
    }
  } catch (error) {
    next(error)
  }
}

module.exports = fetchEHR
