'use strict'

const nock = require('nock')
const { expect, httpStatus } = require('../../index')
const { addParticipant } = require('../../../src/lib/growsurf')
const { apiUrl, campaignId, apiKey } = require('../../../src/lib/growsurf/configs')

describe('Add Growsurf Participant / ', () => {
  const reqheaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}`
  }

  const URL = `${apiUrl}/campaign/${campaignId}`

  before(() => {
    if (!nock.isActive()) nock.activate()
  })

  afterEach(() => nock.cleanAll())
   
  after(() => nock.restore())

  it(`Should call api & return ${httpStatus.OK}`, async () => {
    const mockSuccessResponse = {
      id: '3vxff9',
      firstName: 'Gavin',
      lastName: 'Belson',
      shareUrl: 'https://hoolie.com?grsf=3vxff9',
      email: 'gavin@hooli.com'
    }
  
    // expected body to be sent
    const body = {
      email: 'gavin@hooli.com'
    }
  
    const scope = nock(URL, { reqheaders })
      .persist(false)
      .post('/participant', body)
      .reply(200, mockSuccessResponse)
      
    const res = await addParticipant(body)
    expect(res.status).to.be.eql(httpStatus.OK)
    expect(scope.isDone()).to.be.true
  })
})
