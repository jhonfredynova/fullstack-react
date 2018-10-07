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
  afterValidate: async function(values){
    try{
      let errors = []
      let data = null
      if(values.plan && values.feature){
        data = await PlanFeature.findOne({ id: { '!=': values.id }, plan: values.plan, feature: values.feature })
        if(data) errors.push(intlService.i18n('planFeatureAlreadyExist'))
      }
      if(errors.length>0){
        errors = errors.join(intlService.i18n('errorSeparator'))
      }
      return errors
    }catch(e){
      throw e
    }
  },
  beforeCreate: async function (values, next) {
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
  beforeUpdate: async function (values, next) {
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

