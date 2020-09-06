'use strict'

/**
 * Type of use for a particular name
 * http://hl7.org/fhir/name-use
 */
module.exports.USE_TYPE = {
  USUAL: 'usual',
  OFFICIAL: 'official',
  TEMP: 'temp',
  NICKNAME: 'nickname',
  ANONYMOUS: 'anonymous',
  OLD: 'old',
  MAIDEN: 'maiden'
}

module.exports.FAMILY_NAME_MAX_LENGTH = 200
module.exports.GIVEN_NAME_MAX_LENGTH = 200
module.exports.PREFIX_NAME_MAX_LENGTH = 100
module.exports.SUFFIX_NAME_MAX_LENGTH = 100
