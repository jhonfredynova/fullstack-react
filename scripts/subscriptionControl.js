module.exports = {
  friendlyName: 'Subscription control',
  description: 'Check the status of subscriptions and process payments and cancellations',
  inputs: {},
  fn: async function (inputs, exits) {
    try{
      sails.log('Running custom shell script... (`subscription-control`)')
      const { plans } = sails.config.app
      let currentBilling = null
      let userBilling = []
      let userSubscriptions = []
      let users = await sails.models.user.find().populateAll()
      for(let user of users){
        if(user.clientCode){
          user.clientInfo =  await paymentService.executeApiPayu('GET', `/customers/${user.clientCode}`)
        }
        currentBilling = null
        userBilling = []
        userSubscriptions = _.get(user.clientInfo, 'subscriptions', []).filter(item => plans.subscriptions.includes(item.plan.planCode))
        for(let subscription of userSubscriptions){
          currentBilling = await paymentService.executeApiPayu('GET', `/recurringBill?subscriptionId=${subscription.id}`)
          currentBilling = _.orderBy(currentBilling.recurringBillList, ['dateCharge'], ['desc'])[0] || {}
          // cancel subscription
          if(['CANCELLED','NOT_PAID'].includes(currentBilling.state)){
            sails.models.user.update({ id: user.id }, { nextPlan: null, plan: plans.free })
          }
          // change subscription
          if(user.nextPlan && (currentBilling.dateCharge-Date.now())/36e5<2){
            await paymentService.executeApiPayu('DELETE', `/subscriptions/${subscription.id}`)
            if(nextPlan.planCode){
              await paymentService.executeApiPayu('POST', `/subscriptions`, {
                quantity: 1,
                installments: 1,
                trialDays: 0,
                immediatePayment: true,
                customer: { id: user.clientCode, creditCards: user.clientInfo.creditCardsm.map(item => item.token) },
                plan: { planCode: user.nextPlan.planCode }
              })
            }
            sails.models.user.update({ id: user.id }, { nextPlan: null, plan: user.nextPlan.id })
          }
        }
      }
    }catch(e){
      
      sails.log('Error running script... (`subscription-control`)')
    }
    return exits.success()
  }
}

