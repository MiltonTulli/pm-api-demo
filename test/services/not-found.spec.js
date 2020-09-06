'use strict'

const {
  httpStatus,
  boot,
  expect,
  request,
  app
} = require('../index')

const path = '/unknown-path'

describe(`GET ${path}`, () => {
  before(boot)

  it(`Should return ${httpStatus.NOT_FOUND} if requesting a non-existent path`, (done) => {
    request(app)
      .get(path)
      .end((err, { status, body }) => {
        expect(err).to.be.null
        expect(status).to.equal(httpStatus.NOT_FOUND)
        expect(body).to.eql({
          statusCode: 404,
          name: httpStatus['404_NAME'],
          message: 'Resource not found'
        })
        done()
      })
  })
})
