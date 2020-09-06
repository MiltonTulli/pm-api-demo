'use strict'

const httpStatus = require('http-status')
const debug = require('debug')('services:patients:ehr-providers:medfusion:sync')
const { sqsUrl } = require('../../../../../configs')
const sqs = require('../../../../../lib/aws/sqs')(sqsUrl)
const { PROVIDERS } = require('../../../../../models/Patient/schemas/ehr-providers/EHRProviders.constants') // eslint-disable-line

const TASK = {
  SYNC: 'sync',
  SYNC_PATIENT: 'syncPatient',
  PROCESS_LANDING_EHR: 'processLandingEHR'
}

const sync = async (req, res, next) => {
  const { patient } = req.locals
  try {
    const message = { provider: PROVIDERS.MEDFUSION, patientId: patient.id }
    const messageAttributes = {
      taskname: {
        DataType: 'String',
        StringValue: TASK.SYNC_PATIENT
      }
    }
    debug('Sending message %O to sqsUrl %O', message, sqsUrl)
    await patient.setAsVerified()
    await sqs.send(message, messageAttributes)
    res.sendStatus(httpStatus.NO_CONTENT)
  } catch (error) {
    next(error)
  }
}

module.exports = sync
