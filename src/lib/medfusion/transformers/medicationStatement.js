'use strict'

const _ = require('lodash')

const transform = (liveDoc) => {
  if (_.get(liveDoc, 'type') !== 'MEDICATIONSv2' || _.get(liveDoc, 'data.resourceType') !== 'MedicationStatement') return null // eslint-disable-line max-len
  const data = _.get(liveDoc, 'data')
  if (!data) return null

  const liveDocId = _.get(liveDoc, 'id')

  const meta = {
    type: 'MEDICATIONSv2',
    createTime: _.get(liveDoc, 'createTime'),
    modifiedTime: _.get(liveDoc, 'modifiedTime'),
    isArchived: _.get(liveDoc, 'isArchived'),
    profileId: _.get(liveDoc, 'profileId'),
    sourcePortalIds: _.get(liveDoc, 'sourcePortalIds')
  }

  const note = _.get(data, 'note')
  const contained = _.get(data, 'contained', [])
  const medication = _.find(contained, { resourceType: 'Medication' })
  if (!medication) return null
  // try to get the medication code, if not we use the user text
  const coding = _.get(medication, 'code.coding', [])
  const code = _.find(coding, { system: 'http://www.nlm.nih.gov/research/umls/rxnorm' })
  if (code) {
    code.rxnorm = code.code
  }
  const text = _.get(medication, 'code.text')
  return {
    liveDocId,
    meta,
    note,
    code,
    text
  }
}

module.exports = transform
