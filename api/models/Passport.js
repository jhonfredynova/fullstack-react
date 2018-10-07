/**
* Passport.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    protocol: {
      type: 'string',
      required: true
    }, 
    identifier: {
      type: 'string',
      allowNull: true
    },
    token: {
      type: 'string'
    },
    provider: {
      type: 'string'
    },
    user: {
      model: 'User',
      required: true
    }
  },
  customToJSON: function(){
    return _.omit(this, ['id','user','token'])
  }
  
}

