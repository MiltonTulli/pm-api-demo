'use strict'

const TARGET_DESCRIPTORS_TYPES = ['cancer_stage', 'histology', 'biomarker']
const VIEW_NAME = 'DescriptorSummaryView'
/* eslint-disable max-len */
module.exports = {
  async up(db) {
    await db.collection(VIEW_NAME).drop()
    await db.createCollection(VIEW_NAME, {
      viewOn: 'Descriptor',
      pipeline: [
        {
          $match: { type: { $in: TARGET_DESCRIPTORS_TYPES } }
        },
        {
          $lookup: {
            from: 'ExpandedConditionView',
            let: { descrtiptorId: '$_id' },
            pipeline: [
              { $match: { 'patient.isVerified': true } },
              { $match: { $expr: { $in: ['$$descrtiptorId', '$descriptors'] } } },
              { $group: { _id: null, n: { $sum: 1 } } }
            ],
            as: 'totalPatientsWithBiomarker'
          }
        },
        {
          $addFields: {
            total: { $sum: '$totalPatientsWithBiomarker.n' }
          }
        }
      ]
    })
  },
  async down(db) {
    await db.collection(VIEW_NAME).drop()
  }
}
