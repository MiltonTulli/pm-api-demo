'use strict'

const { expect } = require('../../index')
const medfusion = require('../../../src/lib/medfusion')

describe('Medfusion', () => {
  it('should have all props', () => {
    expect(medfusion)
      .to.be.an('object')
      .that.has.all.keys('users', 'tokens', 'config', 'directory', 'CONSTANTS')
  })
})
