'use strict'

const create = async (req, res, next) => {
  const { user, body: patientData } = req

  try {
    const patient = await user.createPatient(patientData)
    res.json(patient)
  } catch (error) {
    next(error)
  }
}

module.exports = create
