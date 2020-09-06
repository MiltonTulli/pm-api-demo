'use strict'

const random = async (req, res, next) => {
  const { patient } = req.locals
  const { n } = req.query

  try {
    const peers = await patient.findPeers({ n })
    res.json(peers)
  } catch (error) {
    next(error)
  }
}

module.exports = random
