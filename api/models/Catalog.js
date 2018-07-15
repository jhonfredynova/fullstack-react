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
      required: true,
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
      type: 'integer'
    },
    thumbnail: {
      type: 'string'
    },
    parent: {
      model: 'Catalog'
    }
  },
  beforeValidate: async (values, cb) => {
    try{
      if (isNaN(values.order)) values.order = null
      cb()
    }catch(e){
      cb(e)
    }
  },
  afterValidate: async (values, cb) => {
    try{
      let errors = []
      let data = await Catalog.findOne().where({ id: { '!': values.id }, parent: values.parent, name: values.name })
      if(data){
        errors.push(intlService.__('catalogNameAlreadyExist'))
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

