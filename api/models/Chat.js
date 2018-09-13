/**
 * Chat.js
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
    from: {
      model: 'user',
      required: true
    },
    to: {
      /*model: 'user',*/
      type: 'string',
      required: true
    },
    messages: {
      collection: 'chatMessage',
      via: 'chat'
    }
  }

}

