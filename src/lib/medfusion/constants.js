'use strict'

/**
 * Medfusion liveDoc resource type
 * source: https://apis.medfusion.com/docs/health-data#section-resource-types
 */
module.exports.RESOURCE_TYPE = {
  CONDITIONSv1: 'CONDITIONSv1',
  PROCEDURES_FHIR_DSTU2: 'PROCEDURES_FHIR_DSTU2',
  ALERTSv1: 'ALERTSv1',
  MEDICATIONSv2: 'MEDICATIONSv2',
  IMMUNIZATIONSv1: 'IMMUNIZATIONSv1',
  VITAL_SIGNSv1: 'VITAL_SIGNSv1',
  RESULTSv1: 'RESULTSv1',
  DEMOGRAGHICS: 'DEMOGRAGHICS',
  APPOINTMENTSv1: 'APPOINTMENTSv1'
}

module.exports.FHIR_RESOURCE_TYPE = {
  MEDICATION_STATEMENT: 'MedicationStatement',
  BUNDLE: 'Bundle',
  MEDICATION: 'Medication'
}
