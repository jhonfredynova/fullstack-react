/**
 * Message.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    active: {
      type: 'boolean',
      defaultsTo: true
    },
    value: {
      type: 'string',
      required: true
    },
    seen: {
      type: 'boolean',
      defaultsTo: false
    },
    chat: {
      model: 'chat',
      required: true
    }
  }

}

