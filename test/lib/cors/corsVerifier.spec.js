'use strict'

const _ = require('lodash')
const sinon = require('sinon')
const { expect, chance } = require('../../index')
const originVerifier = require('../../../src/lib/cors/originVerifier')

describe('Cors Controller', () => {
  // create uniq random url
  const allowedCorsDomains = _.times(3, () => chance.domain())
  const notAllowedCorsDomains = _.difference(_.times(3, () => chance.domain()), allowedCorsDomains) // eslint-disable-line
  const verifier = originVerifier(allowedCorsDomains)

  it('should throw an error if domain is not allowed', () => {
    const notAllowedOrigin = chance.url({ domain: _.sample(notAllowedCorsDomains) })
    const spy = sinon.spy()

    verifier(notAllowedOrigin, spy)
    expect(spy.calledOnce).to.be.true
    expect(spy.getCall(0).args[0])
      .to.be.an('error')
      .that.has.property('message', `Origin ${notAllowedOrigin} not allowed by CORS.`)
  })

  it('should allow if domain is within the allowed domains', () => {
    const allowedDomain = chance.url({ domain: _.sample(allowedCorsDomains) })
    const spy = sinon.spy()

    verifier(allowedDomain, spy)
    expect(spy.calledOnceWith(null, true)).to.be.true
  })
})
