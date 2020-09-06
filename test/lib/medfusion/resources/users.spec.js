'use strict'

const nock = require('nock')
const { expect, chance } = require('../../../index')
const medfusion = require('../../../../src/lib/medfusion')
const { baseURL: medfusionBaseURL } = require('../../../../src/lib/medfusion/api')
const { medfusionUtil } = require('../../../util')

describe('Medfusion Resource users', () => {
  let userUuid
  let userAccessToken
  let profileId
  let customerAccessToken
  let reqheaders
  let path

  before(() => {
    if (!nock.isActive()) nock.activate()
  })

  beforeEach(() => {
    userUuid = chance.guid()
    userAccessToken = medfusionUtil.createUserAccessToken()
    customerAccessToken = medfusionUtil.createCustomerAccessToken()
    profileId = chance.integer({ min: 1, max: 2000 })
    /* eslint-disable quote-props */
    reqheaders = {
      'content-type': 'application/json',
      'accept': 'application/json',
      'x-api-key': medfusion.config.apiKey,
      'user-agent': 'axios/0.18.0'
    }
    /* eslint-enable quote-props */
  })

  afterEach(() => nock.cleanAll())

  after(() => nock.restore())

  describe('create()', () => {
    beforeEach(() => {
      Object.assign(reqheaders, {
        authorization: `Bearer ${customerAccessToken}`,
        'content-length': 2
      })
      path = '/users'
    })

    it('should create a new user', async () => {
      // expected mock response
      const mockSuccessResponse = {
        uuid: userUuid,
        customerUuid: chance.guid()
      }
  
      // expected body to be sent
      const body = {}
      // create a nock scope
      const scope = nock(`${medfusionBaseURL('v1')}`, { reqheaders })
        .post(path, body)
        .reply(200, mockSuccessResponse)
      
      await medfusion.users.create(customerAccessToken)
  
      expect(scope.isDone()).to.be.true
    })
  })

  describe('tokens()', () => {
    beforeEach(() => {
      Object.assign(reqheaders, {
        accept: 'application/json',
        authorization: `Bearer ${customerAccessToken}`,
        'user-agent': 'axios/0.18.0',
        'content-type': 'application/json',
        'content-length': 2
      })
      path = `/users/${userUuid}/tokens`
    })
    
    it('should create a new user access token', async () => {
      // expected mock response
      const mockSuccessResponse = {
        accessToken: userAccessToken
      }
  
      // Variables to send
      const body = {}
  
      // create a nock scope
      const scope = nock(`${medfusionBaseURL('v1')}`, { reqheaders })
        .persist(false)
        .post(path, body)
        .reply(200, mockSuccessResponse)
      
      await medfusion.users.createAccessToken({ userUuid, customerAccessToken })
  
      expect(scope.isDone()).to.be.true
    })
  })

  describe('profiles()', () => {
    beforeEach(() => {
      Object.assign(reqheaders, {
        authorization: `Bearer ${userAccessToken}`,
        'content-type': 'application/json'
      })
      path = `/users/${userUuid}/profiles`
    })

    it('should call medfusion for user profiles', async () => {
      const mockSuccessResponse = [
        {
          userUuid,
          name: 'me',
          zip: '',
          relationType: 'SELF',
          id: 1131,
          isSelf: true
        }
      ]
      // create a nock scope
      const scope = nock(`${medfusionBaseURL('v1')}`, { reqheaders })
        .persist(false)
        .get(path)
        .reply(200, mockSuccessResponse)
      
      await medfusion.users.profiles({ userUuid, userAccessToken })
  
      expect(scope.isDone()).to.be.true
    })
  })

  describe('user.resources.list', () => {
    beforeEach(() => {
      Object.assign(reqheaders, {
        authorization: `Bearer ${userAccessToken}`,
        'content-type': 'application/json'
      })
      path = `/users/${userUuid}/profiles/${profileId}/resources`
    })

    it('Should return all user resources types by default', async () => {
      const scope = nock(`${medfusionBaseURL('v1')}`, { reqheaders })
        .persist(false)
        .get(path)
        .reply(200, {})
      await medfusion.users.resources.list({
        userAccessToken,
        userUuid,
        profileId
      })
      expect(scope.isDone()).to.be.true
    })

    it('Should return all user resources filtered by type', async () => {
      const allResourcesTypes = Object.values(medfusion.CONSTANTS.RESOURCE_TYPE)
      const resourceType = chance.pickone(allResourcesTypes)
      
      const scope = nock(`${medfusionBaseURL('v1')}`, { reqheaders })
        .persist(false)
        .get(path)
        .query({ resourceType })
        .reply(200, {})
  
      await medfusion.users.resources.list({
        userAccessToken,
        userUuid,
        profileId,
        resourceType
      })
      expect(scope.isDone()).to.be.true
    })

    it('Should return all user resources filtered by sinceDate', async () => {
      /* eslint-enable quote-props */
      const sinceDate = (new Date()).toISOString()
      const scope = nock(`${medfusionBaseURL('v1')}`, { reqheaders })
        .persist(false)
        .get(path)
        .query({ sinceDate })
        .reply(200, {})
  
      await medfusion.users.resources.list({
        userAccessToken,
        userUuid,
        profileId,
        sinceDate
      })
      expect(scope.isDone()).to.be.true
    })
  })

  describe('user.resources.retrieve', () => {
    let resourceId
    
    beforeEach(() => {
      resourceId = chance.guid()
      Object.assign(reqheaders, {
        authorization: `Bearer ${userAccessToken}`,
        'content-type': 'application/json'
      })
      path = `/users/${userUuid}/profiles/${profileId}/resources/${resourceId}`
    })

    it('Should return one liveDoc from medfusion', async () => {
      const scope = nock(`${medfusionBaseURL('v1')}`, { reqheaders })
        .persist(false)
        .get(path)
        .reply(200, {})
  
      await medfusion.users.resources.retrieve({
        userAccessToken,
        userUuid,
        profileId,
        resourceId
      })
      expect(scope.isDone()).to.be.true
    })
  })
})
