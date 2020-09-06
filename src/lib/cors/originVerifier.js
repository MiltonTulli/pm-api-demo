'use strict'

const url = require('url')
const debug = require('debug')('cors:originVerifier')

/**
 * This method is a constructor it return a verifier function that will
 * check origin url against the white list of allowed domains.
 * @param {String[]} corsAllowedDomains - array of allowed domains
 * e.g ['peermedical.com', 'medfusion.com', 'anotherdomain.io']
 * @returns {Function} returns a function that receive two parameter
 * origin: the url you want to check
 * cb: callback function with this signature (error, succes) => {}
 */
const originVerifier = corsAllowedDomains => (origin, cb) => {
  // Don't want to block REST tools or server-to-server requests.
  if (!origin) return cb(null, true)

  const originDomain = url.parse(origin).hostname
  debug(`CORS origin domain is: ${originDomain}`)

  const allowed = corsAllowedDomains.includes(originDomain)

  return allowed ? cb(null, true) : cb(new Error(`Origin ${origin} not allowed by CORS.`))
}

module.exports = originVerifier
