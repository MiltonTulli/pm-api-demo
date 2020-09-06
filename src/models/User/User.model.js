'use strict'

const mongoose = require('mongoose')
const validator = require('validator')
const Promise = require('bluebird')
const _ = require('lodash')
const debug = require('debug')('models:User')
const AgreementAcceptanceSchema = require('../Agreement/AgreementAcceptanse.schema')
const { AGREEMENT_TYPES } = require('../Agreement/Agreement.constants')
const { createHash } = require('../../lib/intercom')

const validAgreementsTypes = Object.keys(AGREEMENT_TYPES)
const {
  EMAIL_INDEX_NAME,
  FIRST_NAME_MAX_LENGTH,
  LAST_NAME_MAX_LENGTH,
  ROLES,
  ACCOUNT_TYPE,
  STATUS
} = require('./User.constants')

const { GENDER } = require('../Patient/Patient.constants')
const { USE_TYPE } = require('../Patient/schemas/HumanName.constants')

const { Schema } = mongoose

const rolesEnum = Object.values(ROLES)
const accountTypes = Object.values(ACCOUNT_TYPE)
const userStatuses = Object.values(STATUS)

const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, 'email is required'],
    validate: {
      validator: validator.isEmail,
      message: ({ value }) => `${value} is not a valid email address`
    }
  },
  firstName: {
    type: String,
    maxlength: [FIRST_NAME_MAX_LENGTH, 'first name can contain at most {MAXLENGTH} chars'],
    trim: true
  },
  lastName: {
    type: String,
    maxlength: [LAST_NAME_MAX_LENGTH, 'last name can contain at most {MAXLENGTH} chars'],
    trim: true
  },
  roles: {
    type: [
      {
        type: String,
        enum: {
          values: rolesEnum,
          message: `role must be one of [${rolesEnum}]`
        }
      }
    ],
    required: [true, 'user should have at least 1 role'],
    validate: [
      {
        validator(value) {
          return _.uniq(value).length === value.length
        },
        msg: 'roles should be unique'
      },
      {
        validator(value) {
          return value.length > 0
        },
        msg: 'user should have at least 1 role'
      }
    ]
  },
  accountType: {
    type: String,
    default: ACCOUNT_TYPE.GUEST,
    enum: {
      values: accountTypes,
      msg: `invalid account type {VALUE}, must be one of [${accountTypes}]`
    },
    required: [true, 'account type is required']
  },
  status: {
    type: String,
    default: STATUS.ACTIVE,
    enum: {
      values: userStatuses,
      msg: `invalid user status {VALUE}, must be one of [${userStatuses}]`
    },
    required: [true, 'account type is required']
  },
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    validate: [
      {
        validator(value) {
          const patientId = _.defaultTo(this.populated('patient'), value)
          const patientsIds = _.defaultTo(this.populated('patients'), this.patients)
          return !patientId || _.some(patientsIds, id => id.equals(patientId))
        },
        msg: 'patient is not within user patients'
      }
    ]
  },
  patients: [{ type: Schema.Types.ObjectId, ref: 'Patient' }],
  agreements: {
    type: [AgreementAcceptanceSchema],
    validate: {
      validator(val) {
        return _.uniq(val.map(a => a.agreement)).length === val.length
      },
      message: 'Same agreement can not be saved twice'
    },
    required: true
  },
  intercomHash: String
}, {
  timestamps: true,
  collection: 'User',
  toJSON: {
    versionKey: false,
    transform(doc, ret) {
      const userData = _.omit(ret, ['_id'])
      userData.id = ret._id
      return userData
    }
  }
})

/**
 * This method add agreement type acceptanse to current user agreements array
 * @param {String} agreementType : type of agreement
 * ( types: 'models/Agreement/Agreement.constants' )
 */
UserSchema.methods.acceptAgreement = async function acceptAgreements(agreementType) {
  const user = this
  // eslint-disable-next-line max-len
  if (!_.includes(validAgreementsTypes, agreementType)) { throw new Error(`invalid agreement type {${agreementType}} must be one of [${validAgreementsTypes}]`) }
  const Agreement = mongoose.model('Agreement')
  const activeAgreement = await Agreement
    .findOne({ type: agreementType, validThrought: { $exists: false } })
  // eslint-disable-next-line max-len
  if (!activeAgreement) { throw new Error('Agreement doesnt exist or has no current active version') }
  await user.agreements.push({
    agreement: activeAgreement._id,
    acceptanceDate: new Date()
  })
  await user.save()

  return user
}

/**
 * This function upgrades the user account to partner
 * @returns {Promise} returns a promise that fullfill with updated user or
 * reject with corresponding error
*/
UserSchema.methods.setAsPartner = function setAsPartner() {
  return this.updateOne({ accountType: ACCOUNT_TYPE.PARTNER })
}

/**
 * This function creates a new patient and add it to the user patients
 * @param {Object} patientData.names - the patient names, see patient model for
 * more information.
 * @param {String} patientData.gender - the patient gender ['female', 'male', 'other', 'unkown']
 * @param {Date} patientData.birthDate - the patient birthDate
 * @param {Object} patientData - the patient data
 */
UserSchema.methods.createPatient = async function createPatient(patientData) {
  const user = this
  const patient = await mongoose.model('Patient').create(Object.assign({}, patientData, { user: user.id })) // eslint-disable-line max-len
  
  debug(`Adding patient ${patient.id} to user ${user.id}`)
  await user.updateOne({ $addToSet: { patients: patient._id } }, { runValidators: true })
  debug(`Patient ${patient.id} was added to user ${user.id}`)
  
  return patient
}

UserSchema.methods.createDefaultPatient = async function createDefaultPatient(attrs = {}) {
  const user = this
  const defaultPatientData = {
    birthDate: new Date(),
    names: [
      {
        use: USE_TYPE.ANONYMOUS,
        family: ['Unknown'],
        given: ['Unknown']
      }
    ],
    gender: GENDER.UNKNOWN
  }
  debug('creating default patient with params %O', defaultPatientData)
  const patient = await user.createPatient(Object.assign(defaultPatientData, attrs))
  user.patient = patient._id
  user.patients.push(patient._id)
  debug('patients %O', user.patients)
  await user.save()
  return patient
}

UserSchema.methods.hasPatient = function hasPatient(patientId) {
  const user = this
  const patientsIds = _.defaultTo(user.populated('patients'), user.patients)
  return _.includes(_.map(patientsIds, _.toString), patientId)
}

UserSchema.statics.removeUser = async function removeUser(userId) {
  const user = await this.findOneAndUpdate(
    { _id: userId, status: STATUS.ACTIVE },
    { status: STATUS.REMOVING }
  )
  if (!user) return user
  // fetch all
  await Promise.map(user.patients, mongoose.model('ConditionSummary').removeAll)
  await mongoose.model('Patient').removeAll(user._id)
  user.status = STATUS.REMOVED

  return user.save()
}

// User schema hooks
// eslint-disable-next-line func-names
UserSchema.pre('save', function (next) {
  if (this.isNew) {
    this.intercomHash = createHash(this.email)
  }
  next()
})

// User schema index
UserSchema.index({ email: 1 }, { name: EMAIL_INDEX_NAME, unique: true })

mongoose.model('User', UserSchema)
