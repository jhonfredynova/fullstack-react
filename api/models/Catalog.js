/**
* Catalog.js
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
    value: {
      type: 'json',
      required: true
    },
    order: {
      type: 'number'
    },
    thumbnail: {
      type: 'string'
    },
    parent: {
      model: 'Catalog'
    }
  },
  beforeCreate: async (values, next) => {
    try{
      let errors = []
      let data = await sails.models.catalog.findOne({ where: { id: { '!=': values.id }, parent: values.parent, name: values.name } })
      if(data){
        errors.push(intlService.i18n('catalogNameAlreadyExist'))
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

