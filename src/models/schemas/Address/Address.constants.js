'use strict'

/*
http://hl7.org/fhir/address-type
*/
module.exports.TYPE = {
  POSTAL: 'postal',
  PHYSICAL: 'physical'
}

/*
http://hl7.org/fhir/address-use
*/
module.exports.USE = {
  HOME: 'home',
  WORK: 'work',
  TEMP: 'temp',
  OLD: 'old',
  BILLING: 'billing'
}

module.exports.COUNTRY = {
  USA: 'USA'
}

module.exports.STATE_MAX_LENGTH = 150

module.exports.CITY_MAX_LENGTH = 150

module.exports.LINE_MAX_LENGTH = 200
