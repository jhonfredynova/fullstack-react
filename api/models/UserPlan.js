/**
 * UserPlan.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    plan:{
      model: 'plan',
      required: true
    },
    quantity: {
      type: 'integer',
      required: true
    },
    trialDays: {
      type: 'integer',
      required: true
    }
  },
  afterValidate: async function (values, cb) {
    try{
      let errors = []
      let data = await UserPlan.findOne().where({ id: { '!': values.id }, plan: values.plan, user: values.user })
      if(data){
        errors.push(intlService.__('userPlanAlreadyExist'))
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

