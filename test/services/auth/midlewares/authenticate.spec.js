'use strict'

const sinon = require('sinon')
const nock = require('nock')
const mongoose = require('mongoose')
const {
  expect,
  boot,
  cleanDB,
  chance
} = require('../../../index')
const { authenticate } = require('../../../../src/services/auth/middlewares')
const { awsUtil, userUtil } = require('../../../util')

describe('Authenticate', () => {
  before(async () => {
    await boot()
    await cleanDB()
    if (!nock.isActive()) nock.activate()
  })

  afterEach(async () => {
    nock.cleanAll()
    await userUtil.clean()
  })
  
  after(async () => {
    nock.restore()
    await cleanDB()
  })

  it('Should populate user', async () => {
    // create the user
    const user = await mongoose.model('User').create(userUtil.generate())
    const req = {
      get(headerName) {
        return this.headers[headerName]
      },
      headers: {
        Authorization: `Bearer ${awsUtil.cognito.signToken({ email: user.email })}`
      }
    }
    const res = {}
    const next = sinon.spy()

    await authenticate(req, res, next)
    expect(next.calledOnce).to.be.true
    expect(req)
      .to.have.property('user')
      .to.be.an('object')
      .that.is.instanceOf(mongoose.model('User'))
      .that.has.property('email', user.email)
  })

  it('Should fail is no person is linked', async () => {
    // create the person
    const invalidEmail = chance.email()
    const req = {
      get(headerName) {
        return this.headers[headerName]
      },
      headers: {
        Authorization: `Bearer ${awsUtil.cognito.signToken({ email: invalidEmail })}`
      }
    }
    const res = {}
    const next = sinon.spy()

    await authenticate(req, res, next)
    expect(next.calledOnce).to.be.true
    expect(next.firstCall.args[0])
      .to.be.an('error')
      .that.has.property('message', `User with email ${invalidEmail} not found`)
  })
  
  it('Should call next with 401 when no authorization', async () => {
    const req = {
      get(headerName) {
        return this.headers[headerName]
      },
      headers: {}
    }
    const res = {}
    const next = sinon.spy()
    await authenticate(req, res, next)
    expect(next.calledOnce).to.be.true
    expect(next.firstCall.args[0])
      .to.be.an('error')
      .that.has.property('message', 'Missing authorization header')
  })

  it('Should call next with 401 when no authorization is not with correct format', async () => {
    const req = {
      get(headerName) {
        return this.headers[headerName]
      },
      headers: {
        Authorization: 'access_token'
      }
    }
    const res = {}
    const next = sinon.spy()
    await authenticate(req, res, next)
    expect(next.calledOnce).to.be.true
    expect(next.firstCall.args[0])
      .to.be.an('error')
      .that.has.property('message', 'Invalid authorization header')
  })

  it('Should call next with 401 when invalid token type', async () => {
    const req = {
      get(headerName) {
        return this.headers[headerName]
      },
      headers: {
        Authorization: `Access ${awsUtil.cognito.signToken({})}`
      }
    }
    const res = {}
    const next = sinon.spy()
    await authenticate(req, res, next)
    expect(next.calledOnce).to.be.true
    expect(next.firstCall.args[0])
      .to.be.an('error')
      .that.has.property('message', 'Invalid token type')
  })

  it('Should call next with 401 when missing bearer token', async () => {
    const req = {
      get(headerName) {
        return this.headers[headerName]
      },
      headers: {
        Authorization: 'Bearer '
      }
    }
    const res = {}
    const next = sinon.spy()
    await authenticate(req, res, next)
    expect(next.calledOnce).to.be.true
    expect(next.firstCall.args[0])
      .to.be.an('error')
      .that.has.property('message', 'Missing bearer token')
  })
})
