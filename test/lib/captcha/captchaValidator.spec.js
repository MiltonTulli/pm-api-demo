'use strict'

const nock = require('nock')
const { expect } = require('../../index')
const validator = require('../../../src/lib/captcha/captchaValidator')
const { captchaSecretKey, googleUrl, recaptchaValidationUrlPath } = require('../../../src/configs')

describe('Recaptcha Token Validation / ', () => {
  const reqheaders = {
    'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
    'user-agent': 'axios/0.18.0'
  }

  before(() => {
    if (!nock.isActive()) nock.activate()
  })

  afterEach(() => nock.cleanAll())
   
  after(() => nock.restore())
 
  it('Should return false on invalid token', async () => {
    const invalidToken = 'ThiSiSaN1nv4l1dT0K3N'
  
    const scope = nock(googleUrl, { reqheaders })
      .post(recaptchaValidationUrlPath, {})
      .query({
        secret: captchaSecretKey,
        response: invalidToken
      })
      .reply(200, { success: false })
   
    const res = await validator(invalidToken)
    expect(res).to.be.false
    expect(scope.isDone()).to.be.true
  })

  it('Should return true on valid token', async () => {
    const validToken = 'VALIDTOKEN'

    const scope = nock(googleUrl, { reqheaders })
      .post(recaptchaValidationUrlPath, {})
      .query({
        secret: captchaSecretKey,
        response: validToken
      })
      .reply(200, { success: true })

    const res = await validator(validToken)
    expect(res).to.be.true
    expect(scope.isDone()).to.be.true
  })
})
