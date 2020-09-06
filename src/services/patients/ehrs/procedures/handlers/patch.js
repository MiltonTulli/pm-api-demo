'use strict'

const patch = async (req, res, next) => {
  const { body: procedutreData } = req
  const { procedure } = req.locals
  
  try {
    await procedure.updateOne(procedutreData)
    res.json()
  } catch (error) {
    next(error)
  }
}

module.exports = patch
