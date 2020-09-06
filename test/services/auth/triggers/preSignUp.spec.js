'use strict'

const mongoose = require('mongoose')
const sinon = require('sinon')
const nock = require('nock')
const MockDate = require('mockdate')
const {
  captchaSecretKey,
  googleUrl,
  recaptchaValidationUrlPath
} = require('../../../../src/configs')

const {
  boot,
  cleanDB,
  expect,
  chance
} = require('../../../index')
const { userUtil, agreementUtil } = require('../../../util')
const { handler: preSignUp } = require('../../../../src/services/auth/triggers/preSignUp')
const { AGREEMENT_TYPES } = require('../../../../src/models/Agreement/Agreement.constants')

const [siteAgreementType, thirdPartyAgreementType] = Object.keys(AGREEMENT_TYPES)

describe('Auth Trigger PreSignUp:', () => {
  const mockCognitoPreSignUpEvent = ({ email, recaptchaToken }) => ({
    request: {
      userAttributes: { email },
      validationData: { recaptchaToken }
    }
  })

  const reqheaders = {
    'content-type': 'application/x-www-form-urlencoded; charset=utf-8'
  }

  let User
  let email
  let recaptchaToken
  let successValidatorScope
  let Agreement

  before(async () => {
    await boot()
    await cleanDB()
    User = mongoose.model('User')
    Agreement = mongoose.model('Agreement')
    await User.ensureIndexes()
    if (!nock.isActive()) nock.activate()
  })

  beforeEach(async () => {
    await userUtil.clean()
    recaptchaToken = chance.guid()
    email = chance.email()

    successValidatorScope = nock(googleUrl, { reqheaders })
      .post(recaptchaValidationUrlPath, {})
      .query({
        secret: captchaSecretKey,
        response: recaptchaToken
      })
      .reply(200, { success: true })
  })

  after(async () => {
    nock.restore()
    await cleanDB
  })

  afterEach(async () => {
    nock.cleanAll()
    await agreementUtil.clean()
  })

  it('Should create User with Agreements', async () => {
    const siteAgreement = await Agreement.create(agreementUtil.generate({
      type: siteAgreementType
    }))

    await Agreement.create(agreementUtil.generate({
      type: thirdPartyAgreementType
    }))
    const mockedDate = new Date()
    MockDate.set(mockedDate)
    const spy = sinon.spy()
    const signUpevent = mockCognitoPreSignUpEvent({ email, recaptchaToken })
    await preSignUp(signUpevent, {}, spy)
    const usr = await User.findOne({ email })
    expect(usr).to.be.an('object')
    const usrAgreementsArr = Array.from(usr.agreements)
    expect(usrAgreementsArr).to.be.an('array').that.is.not.empty
    expect(usrAgreementsArr[0]).to.be.an('object')
    expect(usrAgreementsArr[0].toJSON())
      .to.have.keys('agreement', 'acceptanceDate', 'createdAt', 'updatedAt')
    const matchUserSiteAgreement = usrAgreementsArr
      .find(a => String(a.agreement) === String(siteAgreement._id))
    expect(matchUserSiteAgreement).to.be.an('object').that.is.not.empty
    expect(matchUserSiteAgreement.acceptanceDate).to.eql(mockedDate)
    MockDate.reset()
  })

  it('Should return error if activeAgreement has expired (validthrought !== null)', async () => {
    const validThrought = chance.date()
    await Agreement.create(agreementUtil.generate({
      type: siteAgreementType,
      validThrought
    }))

    await Agreement.create(agreementUtil.generate({
      type: thirdPartyAgreementType,
      validThrought
    }))

    const spy = sinon.spy()
    const signUpevent = mockCognitoPreSignUpEvent({ email, recaptchaToken })
    await preSignUp(signUpevent, {}, spy)
    const [err] = spy.firstCall.args
    expect(err).to.not.be.null
    expect(err.message).to.be.equal('Agreement doesnt exist or has no current active version')
  })

  it('Should create new user with email into peermedical db', async () => {
    await Agreement.create(agreementUtil.generate({
      type: siteAgreementType
    }))

    await Agreement.create(agreementUtil.generate({
      type: thirdPartyAgreementType
    }))

    // check user doesnt exists
    const spy = sinon.spy()

    const signUpevent = mockCognitoPreSignUpEvent({ email, recaptchaToken })
    await preSignUp(signUpevent, {}, spy)
    expect(spy.calledOnce).to.be.true
    expect(successValidatorScope.isDone()).to.be.true
    const [err, event] = spy.firstCall.args
    expect(err).to.be.null
    expect(event).to.eql(signUpevent)
    await expect(User.find({ email }))
      .to.eventually.be.an('array')
      .that.has.lengthOf(1)
  })

  it('Should not create new user with email into peermedical db', async () => {
    // check person doesnt exists
    const spy = sinon.spy()

    // call preSignUp
    const existingUser = await User.create(userUtil.generate())
    const user = {
      email: existingUser.email,
      recaptchaToken
    }
    const signUpEvent = mockCognitoPreSignUpEvent(user)
    await preSignUp(signUpEvent, {}, spy)
    expect(spy.calledOnce).to.be.true
    expect(successValidatorScope.isDone()).to.be.true
    const [err, event] = spy.firstCall.args
    expect(err).to.be.null
    expect(event).to.eql(signUpEvent)
    await expect(User.find({ email: existingUser.email }))
      .to.eventually.be.an('array')
      .that.has.lengthOf(1)
  })

  it('Should not create new user with invalid Recaptcha token', async () => {
    const spy = sinon.spy()
    const invalidToken = chance.guid()
    
    const failValidatorScope = nock(googleUrl, { reqheaders })
      .post(recaptchaValidationUrlPath, {})
      .query({
        secret: captchaSecretKey,
        response: invalidToken
      })
      .reply(200, { success: false })
   
    // call preSignUp
    const signUpevent = mockCognitoPreSignUpEvent({ email, recaptchaToken: invalidToken })
    await preSignUp(signUpevent, {}, spy)
    expect(failValidatorScope.isDone()).to.be.true
    const [err] = spy.firstCall.args
    const validationError = new Error('Captcha token could not be validated')
    expect(err).to.be.a('Error')
    expect(err.message).to.be.equal(validationError.message)
    await expect(User.find({ email }))
      .to.eventually.be.an('array')
      .that.has.lengthOf(0)
  })
})
