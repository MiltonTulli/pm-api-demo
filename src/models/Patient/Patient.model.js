'use strict'

/**
 * Patient model
 * https://www.hl7.org/fhir/patient.html
 */

const _ = require('lodash')
const moment = require('moment')
const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const debug = require('debug')('models:Patient')
const {
  HumanNameSchema,
  EHRProvidersSchema,
  SharingOptionsSchema,
  ReferralSchema
} = require('./schemas')
const { AddressSchema } = require('../schemas')
const { GENDER, SMOKING_STATUS } = require('./Patient.constants')
const medfusion = require('../../lib/medfusion')
const growSurf = require('../../lib/growsurf')
const { PROVIDERS } = require('./schemas/ehr-providers/EHRProviders.constants')

const { Schema } = mongoose

const smokingEnum = Object.values(SMOKING_STATUS)
const genderEnum = Object.values(GENDER)

const PatientSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'user is required']
  },
  addresses: [AddressSchema],
  names: {
    type: [HumanNameSchema],
    required: [true, 'should have at least 1 name'],
    validate: [{
      validator(value) {
        return value.length > 0
      },
      msg: 'should have at least 1 name'
    }]
  },
  gender: {
    type: String,
    enum: {
      values: genderEnum,
      message: `invalid gender "{VALUE}", must be one of [${genderEnum}]`
    },
    required: [true, 'patient must have a gender']
  },
  smokingStatus: {
    type: String,
    default: SMOKING_STATUS.UNKNOWN,
    enum: {
      values: smokingEnum,
      message: `invalid smoking status "{VALUE}", must be one of [${smokingEnum}]`
    }
  },
  sharingOptions: {
    type: SharingOptionsSchema,
    default: () => ({}),
    required: [true, 'sharing schema is required']
  },
  ehrProviders: EHRProvidersSchema,
  birthDate: {
    type: Date,
    validate: [
      {
        validator(date) {
          return moment.utc(date).isSameOrAfter('1900-01-01')
        },
        msg: 'birth date must be greater than January 1st, 1900 UTC'
      },
      {
        validator(date) {
          return moment.utc().diff(moment.utc(date), 'days') >= 0
        },
        msg: 'birth date cannot be future'
      }
    ],
    required: [true, 'patient must have a birth date']
  },
  isVerified: {
    type: Boolean,
    required: [true, 'isVerified is required'],
    default: false
  },
  hasPortalConnection: {
    type: Boolean,
    required: [true, 'hasPortalConnection is required'],
    default: false
  },
  portals: [{
    type: Schema.Types.ObjectId,
    ref: 'Portal'
  }],
  verificationDate: Date,
  isValidated: {
    type: Boolean,
    required: [true, 'is validated is required'],
    default: false
  },
  referral: ReferralSchema
}, {
  timestamps: true,
  collection: 'Patient',
  toJSON: {
    versionKey: false,
    transform(doc, ret) {
      const patientData = _.omit(ret, ['_id'])
      patientData.id = ret._id
      return patientData
    }
  }
})

PatientSchema.plugin(mongoosePaginate)

/**
 * This function checks if the patient has the specific provider set.
 * @param {String} provider - the provider name
 * @returns {Boolean} returns true if the provider is set
 */
PatientSchema.methods.hasProvider = function hasProvider(provider) {
  return !!_.get(this, `ehrProviders.${provider}`)
}

/**
 * This method creates a user within medfusion and set the property
 * "ehrProviders.medfusion" with the medfusion user uuid
 * @returns {Promise} return a promise that fullfill with the updated user
 * or reject with the corresponding error
 */
PatientSchema.methods.connectToMedfusion = async function connectToMedfusion() {
  const patient = this
  debug(`Creating medfusion user for user ${patient.id}`)
  const { token: customerAccessToken } = await medfusion.tokens.createCustomerAccessToken()
  const { uuid: userUuid } = await medfusion.users.create(customerAccessToken)
  debug(`Attaching medfusion user ${userUuid} to user ${patient.id}`)
  patient.ehrProviders[PROVIDERS.MEDFUSION] = { userUuid }
  return patient.save()
}

/**
 * This method creates a conection with one of the supported providers
 * right now we only have support for medfusion.
 * @param {String} provider - the name of the provider you want to connect
 * @returns {Promise} returns a promise that fullfill with the connection
 * attributtes or reject with corresponding error
 */
PatientSchema.methods.connectToEhrProvider = async function connectToEhrProvider(provider) {
  const patient = this

  if (!patient.ehrProviders) {
    debug(`Patient ${patient.id} has no providers`)
    patient.ehrProviders = {}
  } else if (patient.hasProvider(provider)) {
    debug(`Patient ${patient.id} already has a connection with provider[${provider}]`)
    return patient
  }

  switch (provider) {
    case PROVIDERS.MEDFUSION:
      return patient.connectToMedfusion()
    default:
      throw new Error(`EHR Provider [${provider}] is not supported`)
  }
}

/**
 * This function refresh the medfusion credentials.
 * @returns {Promise} returns a promise that fullfill with the new credentials
 */
PatientSchema.methods.refreshMedfusionCredentials = async function refreshMedfusionCredentials() {
  const patient = this
  
  const medfusionAttrs = _.get(patient, `ehrProviders.${PROVIDERS.MEDFUSION}`)
  if (!medfusionAttrs) throw new Error(`Provider "${PROVIDERS.MEDFUSION}" is not set up.`)
  
  debug('requesting customer accessToken')
  const { token: customerAccessToken } = await medfusion.tokens.createCustomerAccessToken()
  const { userUuid } = medfusionAttrs
  debug(`requesting user accessToken for user ${userUuid}`)
  const { accessToken: userAccessToken } = await medfusion.users.createAccessToken({ userUuid, customerAccessToken }) // eslint-disable-line max-len
  
  medfusionAttrs.accessToken = userAccessToken
  medfusionAttrs.updatedAt = new Date()

  debug(`requesting profile for user ${userUuid}`)
  const profiles = await medfusion.users.profiles({ userUuid, userAccessToken })
  medfusionAttrs.mainProfileId = _.get(profiles, '[0].id')
  
  return patient.save()
}

/**
 * This function refresh an specific provider credentials
 * @param {String} provider - the provider name
 * @returns {Promise} returns a promise that fullfill with the updated
 * credentials or reject with corresponding error
 */
PatientSchema.methods.refreshEhrProviderCredentials = async function refreshEhrProviderCredentials(provider) { // eslint-disable-line max-len
  const patient = this
  switch (provider) {
    case PROVIDERS.MEDFUSION:
      return patient.refreshMedfusionCredentials()
    default:
      throw new Error(`EHR Provider [${provider}] is not supported`)
  }
}

/**
 * This function updates the lastSync date for a specific provider
 * @param {String} provider - the provider name
 * @returns {Promise} returns a promise that fullfills with the updated
 * patient or rejects with the corresponding error
 */
PatientSchema.methods.updateProviderLastSync = async function updateProviderLastSync(provider) {
  const patient = this
  if (!patient.hasProvider(provider)) {
    throw new Error(`Provider "${provider}" is not set up.`)
  }
  const providerAttrs = _.get(patient, `ehrProviders.${provider}`)
  providerAttrs.lastSync = new Date()
  return patient.save()
}

/**
 * This function updates the syncStatus for a specific provider
 * @param {String} provider - the provider name
 * @returns {Promise} returns a promise that fullfills with the updated
 * patient or rejects with the corresponding error
 */
PatientSchema.methods.updateProviderSyncStatus = async function updateProviderSyncStatus(provider, status) { // eslint-disable-line max-len
  const patient = this
  if (!patient.hasProvider(provider)) {
    throw new Error(`Provider "${provider}" is not set up.`)
  }
  const providerAttrs = _.get(patient, `ehrProviders.${provider}`)
  providerAttrs.syncStatus = status
  return patient.save()
}

/**
 * This function set the patient as verified
 * @returns {Promise} returns a promise that fullfills with the updated
 * patient or rejects with the corresponding error
 */
PatientSchema.methods.setAsVerified = async function setAsVerifed() {
  const patient = this
  const User = mongoose.model('User')
  debug('Patient %O verification status', patient.id, patient.isVerified)
  if (patient.isVerified) return patient
  patient.isVerified = true
  const user = await User.findById(_.defaultTo(patient.populated('user'), patient.user))
  debug('Verifying patient %O', patient)
  debug('Triggering referral for patient %O', patient.id)
  try {
    await growSurf.addParticipant({
      email: user.email,
      referredBy: _.get(patient, 'referral.growSurfId', ''),
      referralStatus: 'CREDIT_AWARDED'
    })
  } catch (error) {
    console.error('There was an error when trying to trigger referral for patient %O, %O',
      patient.id, error)
  }
  await user.setAsPartner()
  return patient.save()
}

/**
 * @description This function validate the patient and promote the
 * user to partner
 * @returns {Promise} return a promise that fullfil with the updated
 * patient or reject with the corresponding error
 */
PatientSchema.methods.validateProfile = async function validateProfile() {
  const patient = this
  const User = mongoose.model('User')
  if (patient.isValidated) return patient
  patient.isValidated = true
  if (patient.isVerified) {
    const user = await User.findById(_.defaultTo(patient.populated('user'), patient.user))
    await user.setAsPartner()
  }
  return patient.save()
}

/**
 * @description This function update the patients sharing otpions
 * @returns {Promise} return a promise that fullfil with the updated
 * patient or reject with the corresponding error
 */
PatientSchema.methods.putSharingOptions = async function putSharingOptions(sharingOptions) {
  const patient = this
  await patient.validateProfile()
  debug('setting sharing options %O', sharingOptions)
  patient.sharingOptions = sharingOptions
  return patient.save()
}

PatientSchema.methods.findPeers = async function findPeers({ n = 1 } = {}) {
  const patient = this
  const Patient = mongoose.model('Patient')
  const peers = await Patient.aggregate([
    { $match: { isVerified: true, _id: { $ne: patient._id } } },
    { $sample: { size: n } }
  ])
  const docs = _.map(peers, peer => new Patient(peer))
  const populatedPeers = await Patient.populate(docs, 'portals')
  return populatedPeers
}

/**
 * Find patients that were never synced or were synced before a given date.
 * @param {String} provider - the provider name
 * @param {Date} date - the date to use as threshold
 * @returns {Promise} returns a promise that fullfills with a list of patient ids
 * or rejects with the corresponding error
 */
PatientSchema.statics.findByProviderSyncedBeforeDate = async function findByProviderSyncedBeforeDate(provider, date) { // eslint-disable-line max-len
  const Patient = this
  const providerKey = `ehrProviders.${provider}`
  const lastSyncKey = `${providerKey}.lastSync`

  const hasProvider = { [providerKey]: { $exists: true } }
  const wasSyncedBefore = {
    $or: [
      { [lastSyncKey]: { $lt: date } },
      { [lastSyncKey]: { $exists: false } }
    ]
  }

  return Patient.find(Object.assign({}, hasProvider, wasSyncedBefore)).select('_id').lean()
}

PatientSchema.methods.createConditionSummary = async function createConditionSummary(conditionSummaryData) { // eslint-disable-line max-len
  const patient = this
  const ConditionSummary = mongoose.model('ConditionSummary')
  return ConditionSummary.create(Object.assign({}, conditionSummaryData, { patient: patient.id }))
}

PatientSchema.methods.findOneCondition = function findConditions(query) {
  const patient = this
  const ConditionSummary = mongoose.model('ConditionSummary')
  return ConditionSummary.findOne(Object.assign({}, query, { patient: patient.id }))
}

PatientSchema.methods.findConditions = function findConditions(query) {
  const patient = this
  const ConditionSummary = mongoose.model('ConditionSummary')
  return ConditionSummary.find(Object.assign({}, query, { patient: patient.id }))
}

PatientSchema.methods.createProcedure = function createProcedure(procedureData) {
  const patient = this
  const Procedure = mongoose.model('Procedure')
  return Procedure.create(Object.assign({}, procedureData, { patient: patient.id }))
}

PatientSchema.methods.findEHRs = function findEHRs(query) {
  const patient = this
  const BaseEHR = mongoose.model('EHR')
  return BaseEHR.find(Object.assign({}, query, { patient: patient.id }))
}

/**
 * @description Find one patient's ehr, if multiples records match the query it will
 * return the first match
 * @param {Object} query - filter query
 * @return {Object} return a mongo query for collection EHR forcing the query to be
 * within the scope of the patient
 */
PatientSchema.methods.findOneEHR = function findOneEHR(query = {}) {
  return this.model('EHR').findOne(Object.assign({}, query, { patient: this.id }))
}


PatientSchema.statics.removeAll = function removeAll(userId) {
  const Patient = mongoose.model('Patient')
  return Patient.deleteMany({ user: userId })
}

mongoose.model('Patient', PatientSchema)
