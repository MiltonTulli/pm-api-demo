'use strict'

/**
 * @description
 * This handlers allow a user to put patient sharing options.
 */

const put = async (req, res, next) => {
  const { patient } = req.locals
  const { body: sharingOptions } = req

  try {
    await patient.putSharingOptions(sharingOptions)
    res.end()
  } catch (error) {
    next(error)
  }
}

module.exports = put
