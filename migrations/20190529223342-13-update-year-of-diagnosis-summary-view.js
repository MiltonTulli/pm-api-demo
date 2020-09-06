'use strict'

const VIEW_NAME = 'YearOfDiagnosisSummaryView'
/* eslint-disable max-len */
module.exports = {
  async up(db) {
    await db.collection(VIEW_NAME).drop()
    await db.createCollection(VIEW_NAME, {
      viewOn: 'ExpandedConditionView',
      pipeline: [
        { $match: { 'patient.isVerified': true } },
        { $group: { _id: { $year: '$onsetDateTime' }, total: { $sum: 1 } } }
      ]
    })
  },
  async down(db) {
    await db.collection(VIEW_NAME).drop()
  }
}
