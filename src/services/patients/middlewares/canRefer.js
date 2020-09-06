'use strict'

const { Conflict } = require('http-errors')

const canRefer = async (req, res, next) => {
  const { patient } = req.locals
  const { body: newPatientData } = req
  if (patient.isValidated && 'referral' in newPatientData) {
    next(new Conflict('Can not update patient referal'))
  } else {
    next()
  }
}

module.exports = canRefer
