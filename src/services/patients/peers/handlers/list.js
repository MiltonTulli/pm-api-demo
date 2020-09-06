'use strict'

const mongoose = require('mongoose')

const paginatedPeers = async (req, res, next) => {
  const { patientId } = req.params
  const { offset, limit, startAfter } = req.query
  const Patient = mongoose.model('Patient')
  const options = {
    offset: parseInt(offset, 10),
    limit: parseInt(limit, 10),
    customLabels: {
      totalDocs: 'total'
    }
  }
  let query = { isVerified: true, _id: { $ne: patientId } }
  
  if (startAfter) {
    query = {
      ...query,
      _id: { $ne: patientId, $gt: startAfter }
    }
  }
  
  try {
    const patients = await Patient.paginate(query, options)
    res.json(patients)
  } catch (error) {
    next(error)
  }
}

module.exports = paginatedPeers
