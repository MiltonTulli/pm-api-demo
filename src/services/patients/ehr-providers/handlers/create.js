'use strict'

module.exports = async (req, res, next) => {
  const { patient } = req.locals
  const { provider } = req.params
  try {
    await patient.connectToEhrProvider(provider)
    await patient.refreshEhrProviderCredentials(provider)
    res.json(patient.ehrProviders[provider])
  } catch (error) {
    next(error)
  }
}
