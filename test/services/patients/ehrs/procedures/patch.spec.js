'use strict'

const httpStatus = require('http-status')

const path = '/patients/:patientId/procedures/:procedureId'

describe(`PATCH ${path}`, () => {
  it(`Should return ${httpStatus.FORBIDDEN} if patient doesnt belongs to user`)
  it(`Should return ${httpStatus.OK} with patched procedure`)
})
