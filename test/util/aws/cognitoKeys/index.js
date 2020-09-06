'use strict'

const fs = require('fs')
const path = require('path')
const { pem2jwk } = require('pem-jwk')

const loadKey = name => fs.readFileSync(path.join(__dirname, name))

const keys = []

// push first key pair
keys.push({
  id: 'key1',
  private: loadKey('key1.private'),
  public: loadKey('key1.public')
})
  
keys.push({
  id: 'key2',
  private: loadKey('key2.private'),
  public: loadKey('key2.public')
})

const jwks = keys.map((key) => {
  const jwk = pem2jwk(key.public)
  return {
    kid: key.id,
    alg: 'RS256',
    use: 'sign',
    ...jwk
  }
})

module.exports = {
  jwks,
  keys
}
