'use strict'

/* eslint-disable max-len */

const { expect } = require('../../../../index')
const extractMeta = require('../../../../../src/lib/medfusion/transformers/medications/extractMeta')
const { landingEHRUtil } = require('../../../../util')

describe('Medfusion.transformers.medications.extractMeta', () => {
  let liveDoc
  let expetedResult

  before(() => {
    ({ rawData: liveDoc } = landingEHRUtil.generate())
    expetedResult = {
      liveDocId: liveDoc.id,
      meta: {
        type: liveDoc.type,
        createTime: liveDoc.createTime,
        modifiedTime: liveDoc.modifiedTime,
        isArchived: liveDoc.isArchived,
        profileId: liveDoc.profileId,
        sourcePortalIds: liveDoc.sourcePortalIds
      }
    }
  })

  it('Should return outDoc with meta', () => {
    const { outDoc } = extractMeta({ liveDoc })
    expect(outDoc).to.deep.equal(expetedResult)
  })
})
