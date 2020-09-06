'use strict'

const mongoose = require('mongoose')
const debug = require('debug')('services:auth:triggers:preSignUp')
const db = require('../../../db')
const validateRecaptcha = require('../../../lib/captcha/captchaValidator')
const { EMAIL_INDEX_NAME, ROLES } = require('../../../models/User/User.constants')
const { AGREEMENT_TYPES } = require('../../../models/Agreement/Agreement.constants')

const [siteAgreementType, thirdPartyAgreementType] = Object.keys(AGREEMENT_TYPES)
let mongoDBConnection = null

/* eslint-disable no-param-reassign */
module.exports.handler = async (event, context, callback) => {
  // Allow to reuse mongoDBConnection between function calls.
  context.callbackWaitsForEmptyEventLoop = false

  // Connect to MongoDB if not already connected.
  if (mongoDBConnection === null) {
    mongoDBConnection = await db.connect({
      // Disable mongoose and MongoDB driver buffering
      // in order to fail fast if not connected.
      bufferCommands: false,
      bufferMaxEntries: 0
    })
  }

  debug('Beginning preSignUp for user with attrs %O', event.request.userAttributes)
  debug('Beginning preSignUp request %O', event.request)
  const { email } = event.request.userAttributes
  const { recaptchaToken, referredBy } = event.request.validationData
  
  const User = mongoose.model('User')
  try {
    const captchaValidation = await validateRecaptcha(recaptchaToken)
    if (!captchaValidation) return callback(new Error('Captcha token could not be validated'))
    const usr = await User.create({ email, roles: [ROLES.PATIENT] })
    await usr.acceptAgreement(siteAgreementType)
    await usr.acceptAgreement(thirdPartyAgreementType)
    await usr.createDefaultPatient({ referral: { growSurfId: referredBy } })
    debug(`New User created with email=${email}`)
    return callback(null, event)
  } catch (error) {
    if ([11000, 11001].includes(error.code)
      && error.message.match(/index: (.*) dup key: /)[1] === EMAIL_INDEX_NAME) {
      debug(`Person with assosiated email=${email} already exists`)
      return callback(null, event)
    }
    return callback(error)
  }
}
