'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')

/* eslint-disable max-len */
const lungCancer = async (req, res, next) => {
  try {
    const Descriptor = mongoose.model('Descriptor')
    const ConditionSummary = mongoose.model('ExpandedConditionView')
    const lungCancerCondition = await Descriptor.findOne({ name: 'lung_cancer' })
    const totalLungCancerPatients = await ConditionSummary.count({ type: lungCancerCondition._id, 'patient.isVerified': true })
    const yearOfDiagnosisSummary = await mongoose.model('YearOfDiagnosisSummaryView').find({})
    const summary = await mongoose.model('DescriptorSummaryView').aggregate([
      { $match: { parents: lungCancerCondition._id } },
      {
        $group: {
          _id: '$type',
          values: {
            $push: {
              total: '$total',
              label: '$label',
              name: '$name',
              id: '$_id'
            }
          }
        }
      }
    ])
    const summaryObject = {}
    summary.forEach((sum) => {
      summaryObject[sum._id] = sum.values
    })
    const extractYearOfDiagnosis = ({ _id, total }) => ({
      id: _id,
      total,
      label: _id,
      name: _id
    })
    summaryObject.yearOfDiagnosis = _.map(yearOfDiagnosisSummary, extractYearOfDiagnosis)
    res.json(_.assign({ totalLungCancerPatients, summary: summaryObject }))
  } catch (error) {
    next(error)
  }
}

module.exports = lungCancer
