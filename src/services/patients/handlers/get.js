'use strict'

const get = async (req, res, next) => {
  const { patient } = req.locals

  try {
    res.json(patient)
  } catch (error) {
    next(error)
  }
}

module.exports = get
