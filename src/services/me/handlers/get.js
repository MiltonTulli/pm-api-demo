'use strict'

const _ = require('lodash')

const get = async (req, res) => {
  const { user } = req
  res.json(_.omit(user.toJSON(), 'patients'))
}

module.exports = get
