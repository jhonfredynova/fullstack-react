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
    description: {
      type: 'string',
      required: true
    },
    order: {
      type: 'integer',
      required: true
    },
    paymentType: {
      type: 'string',
      enum: ['subscription', 'transaction']
    },
    planCode: {
      type: 'string'
    },
    transactionValue: {
      type: 'json',
      price: true
    },
    features: {
      collection: 'planfeature',
      via: 'plan',
      through: 'planfeature'
    }
  },
  afterFind: async function(values){
    try{
      let payuPlans = await paymentService.executeApiPayu('GET', '/plans', null)
      for (let item of values){
        item.planInfo = _.find(payuPlans.subscriptionPlanList, { planCode: item.planCode })
        if (item.planInfo) {
          item.planInfo.price = _.find(item.planInfo.additionalValues, { name:'PLAN_VALUE' })
        }
      } 
      return values
    }catch(e){
      return values
    }
  },
  afterValidate: async (values, cb) => {
    try{
      if(values.paymentType==='transaction') delete values.planCode
      let errors = []
      let data = await Plan.findOne().where({ id: { '!': values.id }, name: values.name })
      if(data){
        errors.push(intlService.__('planNameAlreadyExist'))
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

