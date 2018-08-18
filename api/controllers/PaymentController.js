/**
 * PayuController
 *
 * @description :: Server-side logic for managing payus
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  controlSubscriptions: async (req, res) => {
    try{
      let users = await sails.models.user.find({ roles: sails.config.app.roles.registered })
      users = users.toObject()
      for (let user of users)
      {
        if(user.clientCode) {
          let infoPayu = await paymentService.executeApiPayu('GET', `/customers/${user.clientCode}`)
          user.planDetails.customerPayu = infoPayu
        }
        // next billing
        let currentBilling = null
        let nextBilling = null
        if(user.clientCode) {
          let customerPayu = user.planDetails.customerPayu
          let subscriptionId = customerPayu.subscriptions ? customerPayu.subscriptions[0].id : null
          let recurringBills = []
          if (subscriptionId) {
            recurringBills = await paymentService.executeApiPayu('GET', `/recurringBill?subscriptionId=${subscriptionId}`)
            recurringBills = recurringBills.recurringBillList
          }
          let currentBilling = _.sortByOrder(recurringBills, ['dateCharge'], ['desc'])[1]
          let nextBilling = _.sortByOrder(recurringBills, ['dateCharge'], ['desc'])[0]
        }
        // cancel subscription
        if(user.planDetails.plan!==sails.config.app.plans.free && (!currentBilling || (currentBilling && currentBilling.state==='NOT_PAID' || currentBilling.state==='CANCELLED'))) {
          user.process = 'CANCEL_SUBSCRIPTION'
          user.planDetails.subscriptionId = currentBilling.subscriptionId
          user.planDetails.plan = sails.config.app.plans.free
          user.changePlan = {}
        }
        // change subscription
        let isLastDayPlan = nextBilling ? (nextBilling.dateCharge-Date.now())/36e5 <= 4 : true //remain4hours
        if((user.changePlan && user.changePlan.plan) && isLastDayPlan){
          user.process = 'CHANGE_SUBSCRIPTION'
          user.planDetails.subscriptionId = nextBilling.subscriptionId
          user.planDetails.plan = user.changePlan.plan
          user.planDetails.quantity = user.changePlan.quantity
          user.planDetails.trialDays = user.changePlan.trialDays
          user.changePlan = {}
        }
        // update user
        if(user.planDetails.plan===sails.config.app.plans.free) {
          user.planDetails.payuPlanCode = '';
          continue
        }
        let planDetail = await sails.models.plan.findOne({ _id: user.planDetails.plan })
        user.planDetails.payuPlanCode = planDetail.payuPlanCode;
      }
      //response
      users = _.filter(users, user => {
        return (user.process==='CANCEL_SUBSCRIPTION' || user.process==='CHANGE_SUBSCRIPTION');
      })
      res.json(users)
    }catch(e){
      console.error(e)
      res.status(400).send({ message: e.message })
    }
  },

  getBilling: async (req, res) => {
    try{
      let criteria = requestService.parseCriteria(req)
      let recurringBills = await paymentService.executeApiPayu('GET', `/recurringBill?customerId=${criteria.where.clientCode}`, null)
      recurringBills = _.filter(recurringBills.recurringBillList, item => { return item.state==='PAID' })
      // pagination
      let records = requestService.applyFilter(criteria, recurringBills)
      let recordsTotal = requestService.applyFilter(_.pick(criteria, ['where']), recurringBills)
      res.ok(requestService.applyPagination(res, criteria, records, recordsTotal.length))
    }catch(e){
      res.badRequest(e)
    } 
  },

  getSubscription: async (req, res) => {
    try{
      let data = await paymentService.executeApiPayu('GET', `/subscriptions/${req.param('subscriptionId')}`, null)
      res.json(data)
    }catch(e){
      res.badRequest(e)
    }
  },

  getSubscriptionPlan: async (req, res) => {
    try{
      let subscriptionPlans = await paymentService.executeApiPayu('GET', '/plans', null)
      subscriptionPlans = subscriptionPlans.subscriptionPlanList
      for (let item of subscriptionPlans){
        item.price = _.find(item.additionalValues, { name:'PLAN_VALUE' })
      }
      res.ok(subscriptionPlans)
    }catch(e){
      res.badRequest(e)
    }
  },

  createSubscription: async (req, res) => {
    try{ 
      // initializing
      let data = req.body
      let client = null
      if(!data.plan.planCode) throw intlService.i18n('subscriptionCreatedErrorPlan')
      // create client
      let clientList = await paymentService.executeApiPayu('GET', `/customers`)
      client = _.get(clientList, 'customerList', []).find(item => item.email.toLowerCase()===data.client.email.toLowerCase() || item.id===data.client.clientCode)
      data.client.clientCode = _.get(client, 'id')
      if(!data.client.clientCode) {
        let dataClient = {
          fullName: data.client.fullname,
          email: data.client.email
        }
        data.client.clientCode = (await paymentService.executeApiPayu('POST', `/customers`, dataClient)).id
      }
      client = await paymentService.executeApiPayu('GET', `/customers/${data.client.clientCode}`)
      // create creditcard
      client.creditCards = _.get(client, 'creditCards', [])
      if(!data.creditCard.token){
        if(client.creditCards.length>0){
          for(let creditCard of client.creditCards){
            await paymentService.executeApiPayu('DELETE', `/customers/${data.client.clientCode}/creditCards/${creditCard.token}`)
          }
        }
        let dataCreditCard = {
          name: data.creditCard.holder,
          number: data.creditCard.number,
          expMonth: data.creditCard.expiration.month,
          expYear: data.creditCard.expiration.year,
          type: (await paymentService.getCreditCardBrand(data.creditCard)).card.brand.toUpperCase()
        }
        data.creditCard.token = (await paymentService.executeApiPayu('POST', `/customers/${data.client.clientCode}/creditCards`, dataCreditCard)).token
      }
      // create subscription
      client.subscriptions = _.get(client, 'subscriptions', [])
      if(client.subscriptions.length>0) throw intlService.i18n('subscriptionAlreadyExist')
      let dataSubscription = {
        quantity: 1,
        installments: 1,
        trialDays: data.plan.trialDays,
        immediatePayment: true,
        customer: {
          id: data.client.clientCode,
          creditCards: [{
            token: data.creditCard.token
          }]
        },
        plan: {
          planCode: data.plan.planCode
        }
      }
      data.subscription = await paymentService.executeApiPayu('POST', `/subscriptions`, dataSubscription)
      // create user
      let user = await sails.models.user.findOne({ email: data.client.email })
      if(!user){
        await sails.models.user.create(data.client)
      }
      // send notification
      try{
        await mailService.sendEmail({
          fromName: sails.config.app.appName,
          fromEmail: sails.config.app.emails.noreply,
          toEmail: data.client.email,
          subject: intlService.i18n('mailSubscriptionCreatedSubject', { appName: sails.config.app.appName }),
          message: intlService.i18n('mailSubscriptionCreatedMessage', { appName: sails.config.app.appName, startDate: new Date(data.subscription.currentPeriodStart).toLocaleDateString() })
        })
      }catch(e){
        console.warn(ntlService.i18n('emailError'))
      }
      res.json({ message: intlService.i18n('subscriptionCreatedSuccess') })
    }catch(e){
      res.badRequest(intlService.i18n('subscriptionCreatedErrorCard'))
    }
  },

  updateCreditCard: async (req, res) => {
    try{
      if (!req.param('subscriptionId')) {
        throw 'Subscription id not valid'
      }
      let creditCard = req.body
      let data = await paymentService.checkCreditCard(creditCard.number, creditCard.expiration.month, creditCard.expiration.year, creditCard.cvc)
      creditCard.type = data.card.brand.toUpperCase()
      await paymentService.executeApiPayu('DELETE', `/customers/${req.param('clientCode')}/creditCards/${req.param('creditCardId')}`, null)
      creditCard.cvc = null
      data = await paymentService.executeApiPayu('POST', `/customers/${req.param('clientCode')}/creditCards`, creditCard)
      await paymentService.executeApiPayu('PUT', `/subscriptions/${req.param('subscriptionId')}`, { creditCardToken: data.token })
      res.json({ message: 'Se actualizó la tarjeta de crédito de la suscripción correctamente.' })
    }catch(e){
      res.badRequest(e)
    }  
  },

  updateSubscription: async (req, res) => {
    try{
      let data = await paymentService.executeApiPayu('PUT', `/subscriptions/${req.param('subscriptionId')}`, { creditCardToken: req.body.creditCardToken })
      res.json(data)
    }catch(e){
      res.badRequest(e)
    }
  },

  deleteSubscription: async (req, res) => {
    try{
      let expirationDate = null
      let data = await paymentService.executeApiPayu('GET', `/subscriptions/${req.param('subscriptionId')}`, null)
      expirationDate = data.currentPeriodEnd
      data = await paymentService.executeApiPayu('DELETE', `/subscriptions/${req.param('subscriptionId')}`, null)
      // send notification
      let responseEmail = await mailService.sendEmail({
        fromName: sails.config.app.appName,
        fromEmail: sails.config.app.emails.noreply,
        toEmail: req.body.email,
        subject: intlService.i18n('mailSubscriptionSuspendedSubject', { appName: sails.config.appName }),
        message: intlService.i18n('mailSubscriptionSuspendedMessage', { expirationDate: expirationDate })
      })
      if (!responseEmail){
        console.error(intlService.i18n('emailError'))
      }
      res.json({ message: intlService.i18n('subscriptionDeletedSuccess') })
    }catch(e){
      res.badRequest(e)
    }
  }

}

