'use strict'

const _ = require('lodash')

const extractMeta = ({ liveDoc, outDoc = {} }) => {
  const liveDocId = _.get(liveDoc, 'id')

  const meta = {
    type: _.get(liveDoc, 'type'),
    createTime: _.get(liveDoc, 'createTime'),
    modifiedTime: _.get(liveDoc, 'modifiedTime'),
    isArchived: _.get(liveDoc, 'isArchived'),
    profileId: _.get(liveDoc, 'profileId'),
    sourcePortalIds: _.get(liveDoc, 'sourcePortalIds')
  }

  _.merge(outDoc, { meta, liveDocId })

  return { liveDoc, outDoc }
}

module.exports = extractMeta
