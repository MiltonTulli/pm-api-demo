'use strict'

const HumanNameSchema = require('./HumanName.schema')
const EHRProvidersSchema = require('./ehr-providers/EHRProviders.schema')
const SharingOptionsSchema = require('./SharingOptions.schema')
const ReferralSchema = require('./Referral.schema')

module.exports = {
  HumanNameSchema,
  EHRProvidersSchema,
  SharingOptionsSchema,
  ReferralSchema
}
