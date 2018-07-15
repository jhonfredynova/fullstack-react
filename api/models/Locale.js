/**
* Locale.js
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
    }
  },
  afterFind: async function(values){
    try{
      return values
    }catch(e){
      return values
    }
  },
  afterValidate: async (values, cb) => {
    try{
      let errors = []
      let data = await Locale.findOne().where({ id: { '!': values.id }, name: values.name })
      if(data){
        errors.push(intlService.__('localeNameAlreadyExist'))
      }
      if(errors.length>0){
        throw new Error(errors.join(intlService.__('errorSeparator')))
      }
      cb()
    }catch(e){
      cb(e)
    }
  }
}

