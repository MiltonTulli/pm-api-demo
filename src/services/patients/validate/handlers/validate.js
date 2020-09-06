'use strict'

/**
 * @description
 * This handlers allow a suer to validate a verified patient information.
 */

const validate = async (req, res, next) => {
  const { patient } = req.locals

  try {
    await patient.validateProfile()
    res.end()
  } catch (error) {
    next(error)
  }
}

module.exports = validate
