'use strict'

const mongoose = require('mongoose')
const Promise = require('bluebird')
const _ = require('lodash')
const {
  boot,
  cleanDB,
  expect,
  chance
} = require('../index')
const { userUtil, patientUtil, agreementUtil } = require('../util')
const { EMAIL_INDEX_NAME, ROLES } = require('../../src/models/User/User.constants')
const { AGREEMENT_TYPES } = require('../../src/models/Agreement/Agreement.constants')

const [siteAgreementType, thirdPartyAgreementType] = Object.keys(AGREEMENT_TYPES)

describe('User', () => {
  let User
  let Patient

  before(async () => {
    await boot()
    User = mongoose.model('User')
    await User.ensureIndexes()
    Patient = mongoose.model('Patient')
    await Patient.ensureIndexes()
  })

  afterEach(userUtil.clean)
  after(cleanDB)

  it('Should fail if email is not provided', async () => {
    await expect(User.create(userUtil.generate({ email: undefined })))
      .to.eventually.be.rejectedWith('email is required')
  })

  it('Should fail if not a valid email', async () => {
    const invalidEmail = chance.word()
    await expect(User.create(userUtil.generate({ email: invalidEmail })))
      .to.eventually.be.rejectedWith(`email: ${invalidEmail} is not a valid email address`)
  })

  it('Should not allow duplicate emails', async () => {
    const existingUser = await User.create(userUtil.generate())
    await expect(User.create(userUtil.generate({ email: existingUser.email })))
      .to.eventually.be.rejectedWith(`index: ${EMAIL_INDEX_NAME} dup key:`)
  })

  it('Should allow optional firstName', async () => {
    await expect(User.create(userUtil.generate({ firstName: undefined })))
      .to.eventually.be.an('object')
      .that.has.property('firstName', undefined)
  })

  it('Should check firstName max length', async () => {
    await expect(User.create(userUtil.generate({ firstName: chance.word({ length: 201 }) })))
      .to.eventually.be.rejectedWith('first name can contain at most 200 chars')
  })

  it('Should allow optional lastName', async () => {
    await expect(User.create(userUtil.generate({ lastName: undefined })))
      .to.eventually.be.an('object')
      .that.has.property('lastName', undefined)
  })

  it('Should check lastName max length', async () => {
    await expect(User.create(userUtil.generate({ lastName: chance.word({ length: 201 }) })))
      .to.eventually.be.rejectedWith('last name can contain at most 200 chars')
  })

  it('Should have at least one role', async () => {
    await expect(User.create(userUtil.generate({ roles: [] })))
      .to.eventually.be.rejectedWith('user should have at least 1 role')
  })

  it('Should have at least one role, validated when roles is undefined or null', async () => {
    await expect(User.create(userUtil.generate({ roles: undefined })))
      .to.eventually.be.rejectedWith('user should have at least 1 role')
    
    await expect(User.create(userUtil.generate({ roles: null })))
      .to.eventually.be.rejectedWith('user should have at least 1 role')
    
    const userToSave = await User.create(userUtil.generate())
    userToSave.roles = undefined
    
    await expect(userToSave.save())
      .to.eventually.be.rejectedWith('user should have at least 1 role')
    
    userToSave.roles = null

    await expect(userToSave.save())
      .to.eventually.be.rejectedWith('user should have at least 1 role')
    
    await expect(User.findOneAndUpdate({ id: userToSave.id }, { roles: undefined }, { runValidators: true })) // eslint-disable-line max-len
      .to.eventually.be.rejectedWith('user should have at least 1 role')
  })

  it('Should allow only valid roles', async () => {
    const validRoles = Object.values(ROLES)
    const invalidRoles = _.difference(chance.n(chance.word, 5), validRoles)
    await expect(User.create(userUtil.generate({ roles: invalidRoles })))
      .to.eventually.be.rejectedWith(`role must be one of [${validRoles}]`)
  })

  it('Should not allow duplicate roles', async () => {
    const validRoles = Object.values(ROLES)
    const duplicateRole = chance.pickone(validRoles)
    await expect(User.create(userUtil.generate({ roles: [...validRoles, duplicateRole] }))) // eslint-disable-line max-len
      .to.eventually.be.rejectedWith('roles should be unique')
  })

  it('Should not allow duplicate agreements', async () => {
    const Agreement = mongoose.model('Agreement')
    const siteAgreement = await Agreement.create(agreementUtil.generate({
      type: siteAgreementType
    }))
    await Agreement.create(agreementUtil.generate({
      type: thirdPartyAgreementType
    }))
    const duplicateAgreements = Array(2).fill({
      agreement: siteAgreement._id,
      acceptanceDate: new Date()
    })
    await expect(User.create(userUtil.generate({ agreements: duplicateAgreements })))
      .to.eventually.be.rejectedWith('Same agreement can not be saved twice')
  })

  it('Should allow multiples roles', async () => {
    const validRoles = Object.values(ROLES)
    await expect(User.create(userUtil.generate({ roles: validRoles })))
      .to.eventually.be.an('object')
      .that.has.property('roles')
      .to.be.an('array').that.eql(validRoles)
  })

  describe('Patients', () => {
    let patients
    let anotherUserPatient
    let user
    let userPatient

    beforeEach(async () => {
      user = new User(userUtil.generate())
      patients = chance.n(() => new Patient(patientUtil.generate({ user: user.id })), 5)
      userPatient = chance.pickone(patients)
      anotherUserPatient = new Patient(patientUtil.generate({ user: new User() }))
    })

    afterEach(async () => {
      await userUtil.clean()
      await patientUtil.clean()
    })

    describe('Without populated patient', () => {
      it('Should validate if patients is empty', async () => {
        const savedUser = await user.save()
        savedUser.patient = userPatient.id
        await expect(savedUser.save())
          .to.eventually.be.rejectedWith('patient is not within user patients')
      })

      it('Shoud validate that patient is within patients', async () => {
        user.patients = _.map(patients, 'id')
        user.patient = anotherUserPatient.id
        await expect(User.create(user))
          .to.eventually.be.rejectedWith('patient is not within user patients') // eslint-disable-line max-len
      })

      it('Shoud validate that patient is within patients if patiens are populated', async () => {
        user.patients = patients
        user.patient = anotherUserPatient.id
        await expect(User.create(user))
          .to.eventually.be.rejectedWith('patient is not within user patients') // eslint-disable-line max-len
      })
    })

    describe('With populated patient', () => {
      it('Shoud validate that patient is within patients', async () => {
        user.patients = _.map(patients, 'id')
        user.patient = anotherUserPatient
        await expect(User.create(user))
          .to.eventually.be.rejectedWith('patient is not within user patients') // eslint-disable-line max-len
      })

      it('Shoud validate that patient is within patients if patiens are populated', async () => {
        user.patients = patients
        user.patient = anotherUserPatient
        await expect(User.create(user))
          .to.eventually.be.rejectedWith('patient is not within user patients') // eslint-disable-line max-len
      })
    })

    it('Shoud allow if patient is within patients', async () => {
      user.patients = _.map(patients, 'id')
      const patient = chance.pickone(patients)
      await patient.save()
      await user.save()
      user.patient = patient
      await expect(user.save())
        .to.eventually.be.an('object')
        .that.is.instanceOf(User)
        .then((savedUser) => {
          expect(savedUser.patients).to.be.an('array')
          expect(savedUser.patient).to.be.instanceOf(Patient)
        })
    })

    it('Shoud allow if patients are populated is within patients', async () => {
      const savedPatients = await Promise.map(patients, p => p.save())
      user.patients = savedPatients
      await user.save()
      user.patient = chance.pickone(savedPatients).id
      await expect(user.save())
        .to.eventually.be.an('object')
        .that.is.instanceOf(User)
        .then((savedUser) => {
          expect(savedUser.patients).to.be.an('array')
          expect(savedUser.patient).to.be.instanceOf(mongoose.Types.ObjectId)
        })
    })
  })
})
