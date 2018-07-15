/**
* Rol.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    active: {
      type: 'boolean',
      required: true,
      defaultsTo: true
    },
    name: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string',
      required: true,
    },
    users: {
      collection: 'User',
      via: 'roles'
    }
  },
  afterValidate: async (values, cb) => {
    try{
      let errors = []
      let data = await Rol.findOne().where({ id: { '!': values.id }, name: values.name })
      if(data){
        errors.push(intlService.__('rolNameAlreadyExist'))
      }
      if(errors.length>0) {
        throw new Error(errors.join(intlService.__('errorSeparator')))
      }
      cb()
    }catch(e){
      cb(e)
    }
  }  
  
}

