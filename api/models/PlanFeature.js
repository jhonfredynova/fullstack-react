/**
 * PlanFeature.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    active: {
      type: 'boolean',
      required: true,
      defaultsTo: true
    },
    plan: {
      model: 'plan',
      required: true
    },
    feature: {
      model: 'catalog',
      required: true
    },
    quantity: {
      type: 'integer',
      required: true
    },
    order: {
      type: 'integer',
      required: true
    }
  },
  afterValidate: async function (values, cb) {
    try{
      let errors = []
      let data = await PlanFeature.findOne().where({ id: { '!': values.id }, plan: values.plan, feature: values.feature })
      if(data){
        errors.push(intlService.__('planFeatureAlreadyExist'))
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

