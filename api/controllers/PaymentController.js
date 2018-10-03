/**
 * PayuController
 *
 * @description :: Server-side logic for managing payus
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

let crypto = require('crypto')

module.exports = {

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

  getTransaction: async (req, res) => {
    try{
      const { description, email_buyer, reference_sale, state_pol } = req.body
      let transaction = await sails.models.transaction.findOne({ referenceCode: reference_sale })
      if(!transaction) return res.badRequest(intlService.i18n('transactionNotFound'))
      // updating transaction
      let transactionStatus = state_pol.toString()==='4' ? 'approved' : 'rejected'
      await sails.models.transaction.update({ id: transaction.id }, { status: transactionStatus })
      // sending notification
      if(transactionStatus==='approved'){
        try{
          await mailService.sendEmail({
            fromName: sails.config.app.appName,
            fromEmail: sails.config.app.emails.noreply,
            toEmail: email_buyer,
            subject: intlService.i18n('mailTransactionSuccessSubject'),
            message: intlService.i18n('mailTransactionSuccessMessage', { itemDescription: description })
          })
        }catch(e){
          console.warn(intlService.i18n('emailError'))
        }
      }
      res.ok(intlService.i18n('successfulOperation'))
    }catch(e){
      res.badRequest(e)
    }
  },

  createSubscription: async (req, res) => {
    try{ 
      // initializing
      let data = req.body
      let client = null
      if(!data.plan.info.planCode) throw intlService.i18n('subscriptionPlanError')
      if(!data.client.email) throw intlService.i18n('subscriptionClientError')
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
      if(!data.creditCard.token){
        client.creditCards = _.get(client, 'creditCards', [])
        if(client.creditCards.length>0){
          for(let creditCard of client.creditCards){
            await paymentService.executeApiPayu('DELETE', `/customers/${data.client.clientCode}/creditCards/${creditCard.token}`)
          }
        }
        let creditCardData = {
          clientCode: data.client.clientCode,
          creditCard: data.creditCard
        }
        data.creditCard = await paymentService.createCreditCard(creditCardData)
      }
      // create subscription
      client.subscriptions = _.get(client, 'subscriptions', [])
      client.subscriptions = client.subscriptions.filter(item => sails.config.app.plans.subscriptions.includes(item.plan.planCode))
      if(client.subscriptions.length>0){
        throw intlService.i18n('subscriptionAlreadyExist')
      }
      if(data.plan.info.paymentType!=='subscription'){
        throw intlService.i18n('subsciptionPlanError')
      }
      let subscriptionData = {
        quantity: 1,
        installments: 1,
        trialDays: data.plan.trialDays,
        immediatePayment: true,
        customer: { id: data.client.clientCode, creditCards: [_.pick(data.creditCard, ['token'])] },
        plan: { planCode: data.plan.info.planCode }
      }
      data.subscription = await paymentService.createSubscription(subscriptionData)
      // create user
      let user = await sails.models.user.findOne({ email: data.client.email })
      if(!user){
        data.client.plan = data.plan.info.id
        await sails.models.user.create(data.client)
      }else{
        await sails.models.user.update({ id: user.id }, { plan: data.plan.info.id })
      }
      // send notification
      try{
        await mailService.sendEmail({
          fromName: sails.config.app.appName,
          fromEmail: sails.config.app.emails.noreply,
          toEmail: data.client.email,
          subject: intlService.i18n('mailSubscriptionCreatedSubject'),
          message: intlService.i18n('mailSubscriptionCreatedMessage', { appName: sails.config.app.appName })
        })
      }catch(e){
        console.warn(intlService.i18n('emailError'))
      }
      res.json({ message: intlService.i18n('subscriptionCreatedSuccess') })
    }catch(e){
      sails.log(e)
      sails.log(e.message)
      res.badRequest(e)
    }
  },

  createTransaction: async (req, res) => {
    try{
      const data = req.body
      const { appName } = sails.config.app
      const { id: planId, name: planName, transactionValue } = data.plan.info
      let referenceCode = Date.now()
      let signature = `${process.env.PAYU_API_KEY}~${process.env.PAYU_MERCHANT}~${referenceCode}~${transactionValue.value}~${transactionValue.currency.toUpperCase()}`     
      let response = {
        merchantId: process.env.PAYU_MERCHANT,
        accountId: process.env.PAYU_ACCOUNT,
        description: `${appName} (${planName})`,
        referenceCode: referenceCode,
        amount: transactionValue.value,
        tax: 0,
        taxReturnBase: 0,
        currency: transactionValue.currency.toUpperCase(),
        signature: crypto.createHash('md5').update(signature).digest("hex"),
        buyerEmail: data.client.email,
        responseUrl: `${process.env.LOCAL_APP_URL}/buy/response`,
        confirmationUrl: `${process.env.LOCAL_API_URL}/payment/transaction/confirmation`
      }
      await sails.models.transaction.create({ referenceCode: referenceCode, description: `plan-${planId}` })
      res.ok(response)
    }catch(e){
      res.badRequest(e)
    }
  },

  updateCreditCard: async (req, res) => {
    try{
      // get client
      let client = await paymentService.executeApiPayu('GET', `/customers/${req.param('clientCode')}`)
      let creditCard = req.body
      let dataCreditCard = {
        name: creditCard.holder,
        number: creditCard.number,
        expMonth: creditCard.expiration.month,
        expYear: creditCard.expiration.year,
        type: (await paymentService.getCreditCardBrand(creditCard)).card.brand.toUpperCase()
      }
      // update creditCards
      client.creditCards = _.get(client, 'creditCards', [])
      if(client.creditCards.length>0){
        for(let creditCard of client.creditCards){
          await paymentService.executeApiPayu('DELETE', `/customers/${req.param('clientCode')}/creditCards/${creditCard.token}`)
        }
      }
      let responseCreditCard = await paymentService.executeApiPayu('POST', `/customers/${req.param('clientCode')}/creditCards`, dataCreditCard)
      // update subscriptions
      client.subscriptions = _.get(client, 'subscriptions', [])
      client.subscriptions = client.subscriptions.filter(item => [sails.config.app.plans.subscriptions].includes(item.plan.planCode))
      if(client.subscriptions.length>0){
        for(let subscription of client.subscriptions){
          await paymentService.executeApiPayu('PUT', `/subscriptions/${subscription.id}`, { creditCardToken: responseCreditCard.token })
        }
      }
      res.json({ message: intlService.i18n('updateCreditCardSuccessful') })
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

