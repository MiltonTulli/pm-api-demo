'use strict'

const VIEW_NAME = 'ExpandedConditionView'
/* eslint-disable max-len */
module.exports = {
  async up(db) {
    await db.createCollection(VIEW_NAME, {
      viewOn: 'ConditionSummary',
      pipeline: [
        {
          $lookup: {
            from: 'Patient',
            localField: 'patient',
            foreignField: '_id',
            as: 'patient'
          }
        }
      ]
    })
  },
  async down(db) {
    await db.collection(VIEW_NAME).drop()
  }
}
