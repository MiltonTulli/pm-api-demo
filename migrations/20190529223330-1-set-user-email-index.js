'use strict'

const EMAIL_INDEX_NAME = 'user_email_unique'

module.exports = {
  async up(db) {
    await db.collection('User').createIndex({ email: 1 }, { unique: true, name: EMAIL_INDEX_NAME })
  },
  async down(db) {
    await db.collection('User').dropIndex(EMAIL_INDEX_NAME)
  }
}
