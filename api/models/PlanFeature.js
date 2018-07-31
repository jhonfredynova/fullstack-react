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
      type: 'number',
      required: true
    },
    order: {
      type: 'number',
      required: true
    }
  },
  beforeCreate: async function (values, next) {
    try{
      let errors = []
      let data = await PlanFeature.findOne({ where: { id: { '!=': values.id }, plan: values.plan, feature: values.feature } })
      if(data){
        errors.push(intlService.i18n('planFeatureAlreadyExist'))
      }
      if(errors.length>0){
        throw errors.join(intlService.i18n('errorSeparator'))
      }
      next()
    }catch(e){
      next(e)
    }
  }
}

