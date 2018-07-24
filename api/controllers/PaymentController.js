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
        if (user.clientCode) {
          let infoPayu = await paymentService.executeApiPayu('GET', `/customers/${user.clientCode}`)
          user.planDetails.customerPayu = infoPayu
        }
        // next billing
        let currentBilling = null
        let nextBilling = null
        if (user.clientCode) {
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
        if (user.planDetails.plan!==sails.config.app.plans.free && (!currentBilling || (currentBilling && currentBilling.state==='NOT_PAID' || currentBilling.state==='CANCELLED'))) {
          user.process = 'CANCEL_SUBSCRIPTION'
          user.planDetails.subscriptionId = currentBilling.subscriptionId
          user.planDetails.plan = sails.config.app.plans.free
          user.changePlan = {}
        }
        // change subscription
        let isLastDayPlan = nextBilling ? (nextBilling.dateCharge-Date.now())/36e5 <= 4 : true //remain4hours
        if ((user.changePlan && user.changePlan.plan) && isLastDayPlan){
          user.process = 'CHANGE_SUBSCRIPTION'
          user.planDetails.subscriptionId = nextBilling.subscriptionId
          user.planDetails.plan = user.changePlan.plan
          user.planDetails.quantity = user.changePlan.quantity
          user.planDetails.trialDays = user.changePlan.trialDays
          user.changePlan = {}
        }
        // update user
        if (user.planDetails.plan===sails.config.app.plans.free) {
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
      let dataQueryPayu = null
      let planCode = null
      let transactionDetail = null
      let recurringBills = await paymentService.executeApiPayu('GET', `/recurringBill?customerId=${req.param('clientCode')}`, null)
      recurringBills = _.filter(recurringBills.recurringBillList, item => { return item.state==='PAID' })
      for (let item of recurringBills){
        dataQueryPayu = {
          test: false,
          language: req.getLocale(),
          command: "ORDER_DETAIL",
          details: { orderId: item.orderId }
        }
        transactionDetail = await paymentService.executeApiPayuQuery('POST', dataQueryPayu)
        planCode = transactionDetail.result.payload.description.split(' - ')[0]
        item.amount = transactionDetail.result.payload.additionalValues.TX_VALUE.value
        item.plan = planCode.replace(new RegExp('-', 'g'),' ').toUpperCase()
        item.creditCard = {
          brand: transactionDetail.result.payload.transactions[0].paymentMethod,
          number: transactionDetail.result.payload.transactions[0].creditCard.maskedNumber
        }
      }
      recurringBills = _.sortBy(recurringBills, 'dateCharge').reverse()
      res.json(recurringBills)
    }catch(e){
      res.negotiate(e)
    } 
  },

  getSubscription: async (req, res) => {
    try{
      let data = await paymentService.executeApiPayu('GET', `/subscriptions/${req.param('subscriptionId')}`, null)
      res.json(data)
    }catch(e){
      res.negotiate(e)
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
      res.negotiate(e)
    }
  },

	createSubscription: async (req, res) => {
    try{
      // init data
      let data = req.body
      let client = null
      let clientPayu = null
      let creditCard = null
      let subscription = null
      // validate data
      if (!data.plan.planCode){
        throw new Error(intlService.__('subscriptionCreatedErrorPlan'))
      }
      if (!data.creditCard.token) {
        creditCard = await paymentService.checkCreditCard(data.creditCard)
        data.creditCard.type = creditCard.card.brand.toUpperCase()
      }
      // create user
      let clientListPayu = await paymentService.executeApiPayu('GET', `/customers`)
      clientListPayu = clientListPayu ? clientListPayu.customerList : []
      clientPayu = _.find(clientListPayu, item => { 
        return item.email===data.client.email || item.id===data.client.clientCode
      })
      if (!clientPayu) {
        let dataClient = {
          fullName: data.client.fullName,
          email: data.client.email
        }
        client = await paymentService.executeApiPayu('POST', `/customers`, dataClient)
        clientPayu = client
        data.client.clientCode = client.id
      }
      // create creditcard
      if (!data.creditCard.token) {
        if (data.client.clientCode) {
          if (clientPayu.creditCards) {
            await paymentService.executeApiPayu('DELETE', `/customers/${data.client.clientCode}/creditCards/${clientPayu.creditCards[0].token}`, null)
          }
        }
        let dataCreditCard = {
          name: data.client.fullName,
          number: data.creditCard.number,
          expMonth: data.creditCard.expMonth,
          expYear: data.creditCard.expYear,
          type: data.creditCard.type
        }
        creditCard = await paymentService.executeApiPayu('POST', `/customers/${data.client.clientCode}/creditCards`, dataCreditCard)
        data.creditCard.token = creditCard.token
      }
      // create subscription
      let planListPayu = await paymentService.executeApiPayu('GET', `/plans`)
      planListPayu = planListPayu ? planListPayu.subscriptionPlanList : []
      subscription = _.find(clientPayu.subscriptions, item => {
        return _.find(planListPayu, { planCode: item.plan.planCode })
      })
      if (!subscription) {
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
        subscription = await paymentService.executeApiPayu('POST', `/subscriptions`, dataSbuscription)
      }
      // check transaction (it will wait until 2 minutes)
      let timeoutTransaction = 0
      let recurringBills = null
      let nextBilling = {}
      while (!nextBilling.orderId){
        try{
          recurringBills = await paymentService.executeApiPayu('GET', `/recurringBill?subscriptionId=${subscription.id}`)
          nextBilling = _.sortByOrder(recurringBills.recurringBillList, ['dateCharge'], ['asc'])[0]
        }catch(e){
          console.error('Payu transaction is not executed yet...')
          nextBilling = {}
        }
        await new Promise(resolve => setTimeout(resolve, 5000))
        timeoutTransaction += 5
        if (timeoutTransaction>=120) {
          await paymentService.executeApiPayu('DELETE', `/subscriptions/${subscription.id}`)
          throw new Error(intlService.__('subscriptionCreatedError'))
          break
        }
      }
      if (nextBilling.state==='NOT_PAID' || nextBilling.state==='CANCELLED') {
        throw new Error(intlService.__('subscriptionCreatedErrorCard'))
      }
      // send notification
      let responseEmail = await mailService.sendEmail({
        fromName: sails.config.app.appName,
        fromEmail: sails.config.app.emails.noreply,
        toEmail: data.client.email,
        subject: intlService.__('mailSubscriptionCreatedSubject', { appName: sails.config.appName }),
        message: intlService.__('mailSubscriptionCreatedMessage', { appName: sails.config.appName, startDate: subscription.currentPeriodStart })
      })
      if (!responseEmail){
        console.error(intlService.__('emailError'))
      }
      res.json({ message: intlService.__('subscriptionCreatedSuccess') })
    }catch(e){
      res.negotiate(e)
    }
  },

  updateCreditCard: async (req, res) => {
    try{
      if (!req.param('subscriptionId')) {
        throw new Error('Subscription id not valid')
      }
      let creditCard = req.body
      let data = await paymentService.checkCreditCard(creditCard.number, creditCard.expMonth, creditCard.expYear, creditCard.cvc)
      creditCard.type = data.card.brand.toUpperCase()
      await paymentService.executeApiPayu('DELETE', `/customers/${req.param('clientCode')}/creditCards/${req.param('creditCardId')}`, null)
      creditCard.cvc = null
      data = await paymentService.executeApiPayu('POST', `/customers/${req.param('clientCode')}/creditCards`, creditCard)
      await paymentService.executeApiPayu('PUT', `/subscriptions/${req.param('subscriptionId')}`, { creditCardToken: data.token })
      res.json({ message: 'Se actualizó la tarjeta de crédito de la suscripción correctamente.' })
    }catch(e){
      res.negotiate(e)
    }  
  },

  updateSubscription: async (req, res) => {
    try{
      let data = await paymentService.executeApiPayu('PUT', `/subscriptions/${req.param('subscriptionId')}`, { creditCardToken: req.body.creditCardToken })
      res.json(data)
    }catch(e){
      res.negotiate(e)
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
        subject: intlService.__('mailSubscriptionSuspendedSubject', { appName: sails.config.appName }),
        message: intlService.__('mailSubscriptionSuspendedMessage', { expirationDate: expirationDate })
      })
      if (!responseEmail){
        console.error(intlService.__('emailError'))
      }
      res.json({ message: intlService.__('subscriptionDeletedSuccess') })
    }catch(e){
      res.negotiate(e)
    }
  }

}

