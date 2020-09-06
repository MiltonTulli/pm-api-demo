'use strict'

const nock = require('nock')
const { expect } = require('../../../index')
const { medfusionUtil } = require('../../../util')
const { baseURL: medfusionBaseURL } = require('../../../../src/lib/medfusion/api')
const medfusion = require('../../../../src/lib/medfusion')

describe('Medfusion Resource tokens', () => {
  before(() => {
    if (!nock.isActive()) nock.activate()
  })

  afterEach(() => nock.cleanAll())
  
  after(() => nock.restore())

  it('should create a new customer access token', async () => {
    // expected mock response
    const mockSuccessResponse = {
      clientId: medfusion.config.clientId,
      clientSecret: '',
      token: medfusionUtil.createCustomerAccessToken()
    }

    // expected body to be sent
    const body = {
      clientId: medfusion.config.clientId,
      clientSecret: medfusion.config.clientSecret
    }

    // create a nock scope
    const scope = nock(`${medfusionBaseURL('v1')}`)
      .persist(false)
      .post('/tokens', body)
      .reply(200, mockSuccessResponse)
    
    await medfusion.tokens.createCustomerAccessToken()

    expect(scope.isDone()).to.be.true
  })
})
