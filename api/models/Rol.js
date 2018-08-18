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
  beforeCreate: async (values, next) => {
    try{
      let errors = []
      let data = await sails.models.rol.findOne({ id: { '!=': values.id }, name: values.name })
      if(data){
        errors.push(intlService.i18n('rolNameAlreadyExist'))
      }
      if(errors.length>0) {
        throw errors.join(intlService.i18n('errorSeparator'))
      }
      next()
    }catch(e){
      next(e)
    }
  }  
  
}

