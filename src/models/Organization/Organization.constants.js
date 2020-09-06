'use strict'

module.exports = {
  TYPE: {
    PROV: 'prov',
    DEPT: 'dept',
    TEAM: 'team',
    GOVT: 'govt'
  },
  TYPE_ERROR: 'Organization { Type } is required',
  NAME_ERROR: 'Organization { Name } is required and should have at least 3 characters',
  // eslint-disable-next-line max-len
  ADDRESS_ERROR: 'Organization { Address } is required and at least one Organization Address is required',
  NAME_MIN_LENGTH: 3
}
