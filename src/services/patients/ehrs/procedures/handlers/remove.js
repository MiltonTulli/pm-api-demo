'use strict'

const remove = async (req, res, next) => {
  const { procedure } = req.locals
  
  try {
    await procedure.deleteOne({})
    res.json()
  } catch (error) {
    next(error)
  }
}

module.exports = remove
