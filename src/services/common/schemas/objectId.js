'use strict'

const { Joi } = require('celebrate')

const objectId = () => Joi.string().regex(/^[a-f0-9]{24}$/)

module.exports = objectId
