'use strict'

const { Joi } = require('celebrate')
const { objectId } = require('../../common/schemas')

const get = {
  query: Joi.object({
    parentId: objectId().optional(),
    parentName: Joi.string().trim().optional(),
    type: Joi.string().trim().optional()
  })
}

module.exports = get
