'use strict'

const mongoose = require('mongoose')
const sinon = require('sinon')
const { ROLES } = require('../../../../src/models/User/User.constants')
const {
  boot,
  cleanDB,
  expect,
  chance
} = require('../../../index')
const { userUtil } = require('../../../util')
// eslint-disable-next-line max-len
const { handler: preAuthentication } = require('../../../../src/services/auth/triggers/preAuthentication')

describe('Auth Trigger preAuthentication:', () => {
  const mockCognitoPreAuthenticationEvent = ({ email }) => ({
    request: {
      userAttributes: { email }
    }
  })
  let User
  let email
  
  before(async () => {
    await boot()
    await cleanDB()
    User = mongoose.model('User')
    await User.ensureIndexes()
  })

  beforeEach(async () => {
    await userUtil.clean()
    email = chance.email()
  })

  it('Should allow login if is in db', async () => {
    await User.create({ email, roles: [ROLES.PATIENT] })
    const spy = sinon.spy()
    const authEvent = mockCognitoPreAuthenticationEvent({ email })
    await preAuthentication(authEvent, {}, spy)
    expect(spy.calledOnce).to.be.true
    const [err, event] = spy.firstCall.args
    expect(email).to.eql(event.request.userAttributes.email)
    expect(err).to.be.null
    expect(event).to.be.an('object')
    await expect(User.find({ email }))
      .to.eventually.be.an('array')
      .that.has.lengthOf(1)
  })

  it('Should not allow login if user isnt on db', async () => {
    const spy = sinon.spy()
    const authEvent = mockCognitoPreAuthenticationEvent({ email })
    await preAuthentication(authEvent, {}, spy)
    expect(spy.calledOnce).to.be.true
    const [err] = spy.firstCall.args
    expect(err).to.be.not.null
    expect(err.message).to.be.equal(`User with email ${email} not found`)
    await expect(User.find({ email }))
      .to.eventually.be.an('array')
      .that.has.lengthOf(0)
  })

  after(cleanDB)
})
