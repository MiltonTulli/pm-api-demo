'use strict'

/**
 * Administrative Gender
 * http://hl7.org/fhir/administrative-gender
 */
module.exports.GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
  UNKNOWN: 'unknown'
}

/**
 * Code Display  snomed smoker values
 * Keep suggested standar in order to have easy migration when snomed is fully
 * integrated
 * http://hl7.org/fhir/us/core/2017Jan/ValueSet-us-core-observation-ccdasmokingstatus.html
 * 449868002 Current every day smoker
 * 428041000124106 Current some day smoker
 * 8517006 Former smoker
 * 266919005 Never smoker
 * 77176002 Smoker, current status unknown
 * 266927001 Unknown if ever smoked
 * 428071000124103 Current Heavy tobacco smoker
 * 428061000124105 Current Light tobacco smoker
*/
module.exports.SMOKING_STATUS = {
  CURRENT_EVERY_DAY_SMOKER: 'current_every_day_smoker',
  CURRENT_SOME_DAY_SMOKER: 'current_some_day_smoker',
  FORMER_SMOKER: 'former_smoker',
  NEVER_SMOKER: 'never_smoker',
  SMOKER_CURRENT_STATUS_UNKOWN: 'smoker_current_status_unknown',
  CURRRENT_HEAVY_SMOKER: 'current_heavy_tabacco_smoker',
  CURRENTT_LIGHT_SMOKER: 'current_light_tabacco_smoker',
  UNKNOWN: 'unkown_if_ever_smoked'
}
