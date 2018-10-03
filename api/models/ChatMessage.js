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
    sender: {
      model: 'user',
      required: true
    },
    text: {
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

