'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const morgan = require('morgan')
const HttpError = require('http-errors')
const cors = require('../lib/cors')
const {
  celebrateErrorHandler,
  mongooseErrorHandler,
  httpErrorHandler
} = require('../error-handlers')

const { authenticate } = require('./auth/middlewares')

const me = require('./me')
const patients = require('./patients')
const descriptors = require('./descriptors')
const statistics = require('./statistics')
const sendBirdWebhooks = require('./sendbird-webhooks')
const auth = require('./auth')

const router = express.Router()

// locals
router.use((req, res, next) => {
  req.locals = {}
  res.locals = {}
  next()
})

// Set some security headers.
router.use(helmet())

// Add CORS support.
router.options('*', cors)
router.use(cors)

const rawBodySaver = (req, res, buf, encoding) => {
  if (buf && buf.length) req.rawBody = buf.toString(encoding || 'utf8')
}
// Add body parser for all POST, PUT and PATCH.
const jsonParser = bodyParser.json({ verify: rawBodySaver })
router.post('*', jsonParser)
router.put('*', jsonParser)
router.patch('*', jsonParser)

// Log requests.
router.use(morgan(':date[web] - :method :url :status - :user-agent'))

router.use('/me', authenticate, me)
router.use('/patients', authenticate, patients)
router.use('/descriptors', authenticate, descriptors)
router.use('/statistics', statistics)
router.use('/sendbird-webhooks', sendBirdWebhooks)
router.use('/auth/confirmUser', auth)

// Handle requests to non-existing routes.
router.use((req, res, next) => next(new HttpError.NotFound('Resource not found')))

// Handle errors
router.use(celebrateErrorHandler)
router.use(mongooseErrorHandler)
router.use(httpErrorHandler)

module.exports = router
