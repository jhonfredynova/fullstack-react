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
  afterValidate: async function(values){
    try{
      let errors = []
      let data = null
      if(values.name){
        data = await sails.models.rol.findOne({ id: { '!=': values.id }, name: values.name })
        if(data) errors.push(intlService.i18n('rolNameAlreadyExist'))
      }
      if(errors.length>0){
        errors = errors.join(intlService.i18n('errorSeparator'))
      }
      return errors
    }catch(e){
      throw e
    }
  },
  beforeCreate: async function(values, next){
    try{
      //validate
      let errors = await this.afterValidate(values)
      if(errors.length>0) throw errors
      //execute
      next()
    }catch(e){
      next(e)
    }
  },
  beforeUpdate: async function(values, next){
    try{
      //validate
      let errors = await this.afterValidate(values)
      if(errors.length>0) throw errors
      //execute
      next()
    }catch(e){
      next(e)
    }
  }  
}

