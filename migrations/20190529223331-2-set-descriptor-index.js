'use strict'

const DESCRIPTOR_UNIQUE_INDEX_NAME = 'unique_descriptor_type_name'
/* eslint-disable max-len */
module.exports = {
  async up(db) {
    await db.collection('Descriptor').createIndex({ type: 1, name: 1 }, { unique: true, name: DESCRIPTOR_UNIQUE_INDEX_NAME })
  },
  async down(db) {
    await db.collection('Descriptor').dropIndex(DESCRIPTOR_UNIQUE_INDEX_NAME)
  }
}
