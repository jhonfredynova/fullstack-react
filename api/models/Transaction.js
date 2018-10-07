/**
 * Transaction.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    status: {
      type: 'string',
      isIn: ['pending','rejected','approved'],
      defaultsTo: 'pending'
    },
    referenceCode: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string',
      required: true
    }
  },
  customToJSON: function(){
    return _.omit(this, ['description'])
  }
}

