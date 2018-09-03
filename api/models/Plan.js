/**
* Plan.js
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
      required : true
    },
    permalink: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string',
      required: true
    },
    order: {
      type: 'number',
      required: true
    },
    paymentType: {
      type: 'string',
      isIn: ['subscription', 'transaction']
    },
    planCode: {
      type: 'string'
    },
    transactionValue: {
      type: 'json'
    },
    features: {
      collection: 'planfeature',
      via: 'plan'
    }
  },
  afterFind: async (values, next) => {
    try{ 
      let subscriptionPlans = await paymentService.executeApiPayu('GET', '/plans', null)
      let planFeatures = await sails.models.planfeature.find().populateAll()
      for(let plan of values){
        plan.features = _.filter(planFeatures, item => item.plan.id===plan.id)
        plan.subscriptionInfo = _.find(subscriptionPlans.subscriptionPlanList, { planCode: plan.planCode })
        if (plan.subscriptionInfo) {
          plan.subscriptionInfo.price = _.find(plan.subscriptionInfo.additionalValues, { name:'PLAN_VALUE' })
        }
      } 
      next()
    }catch(e){
      next(e)
    }
  },
  beforeCreate: async (values, next) => {
    try{
      //validations
      let errors = []
      let data = await Plan.findOne({ id: { '!=': values.id }, name: values.name })
      if(data){
        errors.push(intlService.i18n('planNameAlreadyExist'))
      }
      if(errors.length>0) {
        throw errors.join(intlService.i18n('errorSeparator'))
      }
      //others
      if(values.paymentType==='transaction') delete values.planCode
      next()
    }catch(e){
      next(e)
    }
  }
}

