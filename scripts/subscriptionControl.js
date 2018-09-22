module.exports = {
  friendlyName: 'Subscription control',
  description: 'Check the status of subscriptions and process payments and cancellations',
  inputs: {},
  fn: async function (inputs, exits) {
    try{
      sails.log('Running custom shell script... (`subscription-control`)')
      const { plans } = sails.config.app
      let currentBilling = null
      let users = await sails.models.user.find().populateAll()
      for(let user of users){
        if(user.clientCode){
          user.clientInfo =  await paymentService.executeApiPayu('GET', `/customers/${user.clientCode}`)
        }
        user.clientInfo.subscriptions = _.get(user.clientInfo, 'subscriptions', [])
        user.clientInfo.subscriptions = user.clientInfo.subscriptions.filter(item => sails.config.app.plans.subscriptions.includes(item.plan.planCode))
        //cancel subscription
        if(user.clientInfo.subscriptions.length===0 && user.plan.id!==plans.free){
          await sails.models.user.update({ id: user.id }, { nextPlan: null, plan: plans.free })
          try{
            await mailService.sendEmail({
              fromName: sails.config.app.appName,
              fromEmail: sails.config.app.emails.noreply,
              toEmail: user.email,
              subject: intlService.i18n('mailSubscriptionCanceledSubject'),
              message: intlService.i18n('mailSubscriptionCanceledMessage')
            })
          }catch(e){
            sails.log(intlService.i18n('emailError'))
          }
        }
        //change subscription
        currentBilling = null
        for(let subscription of user.clientInfo.subscriptions){
          currentBilling = await paymentService.executeApiPayu('GET', `/recurringBill?subscriptionId=${subscription.id}`)
          currentBilling = _.orderBy(currentBilling.recurringBillList, ['dateCharge'], ['desc'])[0] || {}
          if(user.nextPlan && (currentBilling.dateCharge-Date.now())/36e5<2){
            await paymentService.executeApiPayu('DELETE', `/subscriptions/${subscription.id}`)
            if(user.nextPlan.planCode){
              let subscriptionData = {
                quantity: 1,
                installments: 1,
                trialDays: 0,
                immediatePayment: true,
                customer: { id: user.clientCode, creditCards: user.clientInfo.creditCards.map(item => _.pick(item,['token'])) },
                plan: { planCode: user.nextPlan.planCode }
              }
              await paymentService.createSubscription(subscriptionData)
              try{
                await mailService.sendEmail({
                  fromName: sails.config.app.appName,
                  fromEmail: sails.config.app.emails.noreply,
                  toEmail: user.email,
                  subject: intlService.i18n('mailSubscriptionChangedSubject'),
                  message: intlService.i18n('mailSubscriptionChangedMessage', { appName: sails.config.app.appName, planName: user.nextPlan.name })
                })
              }catch(e){
                sails.log(intlService.i18n('emailError'))
              }
            }
            await sails.models.user.update({ id: user.id }, { nextPlan: null, plan: user.nextPlan.id })
          }
        }
      }
      sails.log('Finished custom shell script... (`subscription-control`)')
    }catch(e){
      sails.log('Error running script... (`subscription-control`)')
    }
    return exits.success()
  }
}

