'use strict'

const httpStatus = require('http-status')

const patch = async (req, res, next) => {
  const { body: patientData } = req
  const { patient } = req.locals

  try {
    await patient.updateOne(patientData)
    res.sendStatus(httpStatus.NO_CONTENT)
  } catch (error) {
    next(error)
  }
}

module.exports = patch
