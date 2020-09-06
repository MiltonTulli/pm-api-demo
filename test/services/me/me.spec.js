'use strict'

const mongoose = require('mongoose')
const httpStatus = require('http-status')
const jwt = require('jsonwebtoken')
const {
  app,
  boot,
  cleanDB,
  expect,
  request,
  chance
} = require('../../index')
const { awsUtil, userUtil } = require('../../util')

const PATH = '/me'

describe(`GET ${PATH}`, () => {
  let User
  let user
  
  before(async () => {
    await boot()
    await cleanDB()
    User = mongoose.model('User')
  })

  beforeEach(async () => {
    user = await User.create(userUtil.generate())
  })

  afterEach(userUtil.clean)

  after(cleanDB)
  
  it(`Should return ${httpStatus.UNAUTHORIZED} if no authorization in header`, (done) => {
    request(app)
      .get(PATH)
      .end((err, { status, body }) => {
        expect(err).to.be.null
        expect(status).to.eql(httpStatus.UNAUTHORIZED)
        expect(body).to.eql({
          statusCode: httpStatus.UNAUTHORIZED,
          name: httpStatus['401_NAME'],
          message: 'Missing authorization header'
        })
        done()
      })
  })

  it(`Should return ${httpStatus.UNAUTHORIZED} if token is invalid`, (done) => {
    let invalidToken = awsUtil.cognito.signToken({ email: user.email })
    // we modify this token and sign again with a different secret
    const decoded = jwt.decode(invalidToken)
    invalidToken = jwt.sign({
      ...decoded,
      ...{ email: chance.email() }
    }, chance.guid())
    request(app)
      .get(PATH)
      .set('Authorization', `Bearer ${invalidToken}`)
      .end((err, { status, body }) => {
        expect(err).to.be.null
        expect(status).to.eql(httpStatus.UNAUTHORIZED)
        expect(body).to.eql({
          statusCode: httpStatus.UNAUTHORIZED,
          name: httpStatus['401_NAME'],
          message: 'Invalid id token'
        })
        done()
      })
  })

  it(`Should return ${httpStatus.OK} with user profile`, async () => {
    const token = awsUtil.cognito.signToken({ email: user.email })
    const { status, body } = await request(app)
      .get(PATH)
      .set('Authorization', `Bearer ${token}`)
    expect(status).to.eql(httpStatus.OK)
    expect(body).to.have.keys([
      'id',
      'firstName',
      'lastName',
      'email',
      'createdAt',
      'updatedAt',
      'roles',
      'status',
      'agreements',
      'accountType',
      'intercomHash'
    ])
    expect(body).to.property('firstName', user.firstName)
    expect(body).to.property('lastName', user.lastName)
    expect(body).to.property('id', user.id)
    expect(body).to.property('email', user.email)
  })
})
