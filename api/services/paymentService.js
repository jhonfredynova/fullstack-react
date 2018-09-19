let fs = require('fs'),
axios = require('axios'),
stripe = require('stripe')('sk_test_il3JEQDOub8nhujeD25BiGfB'),
headersApiPayu = {
  url: process.env.PAYU_API_URL,
  headers: {
    'Authorization': `Basic ${Buffer.from(`${process.env.PAYU_API_LOGIN}:${process.env.PAYU_API_KEY}`).toString('base64')}`,
    'Accept': 'Application/json'
  }
}

module.exports = {

  createCreditCard: async (data) => {
    try{
      const { creditCard } = data
      let responseStripe = await stripe.tokens.create({
        card: {
          "number": creditCard.number,
          "exp_month": creditCard.expiration.month,
          "exp_year": creditCard.expiration.year,
          "cvc": creditCard.securityCode
        }
      })
      data.creditCard = {
        name: creditCard.holder,
        number: creditCard.number,
        expMonth: creditCard.expiration.month,
        expYear: creditCard.expiration.year,
        type: responseStripe.card.brand.toUpperCase()
      }
      return await paymentService.executeApiPayu('POST', `/customers/${data.clientCode}/creditCards`, data.creditCard)
    }catch(e){
      throw e
    }
  },

  createSubscription: async (data) => {
    try{
      let subscription = await paymentService.executeApiPayu('POST', `/subscriptions`, data)
      let subscriptionAttempts = 1
      let subscriptionBilling = null
      while(subscriptionAttempts<=12){
        try{
          subscriptionBilling = await paymentService.executeApiPayu('GET', `/recurringBill?subscriptionId=${subscription.id}`)
          subscriptionBilling = _.orderBy(subscriptionBilling.recurringBillList, ['dateCharge'], ['asc'])[0]
          break
        }catch(e){
          sails.log(`Subscription #(${subscription.id}) not executed, attempt #${subscriptionAttempts}`)
          await new Promise(resolve => setTimeout(() => resolve('ok'), 5000)) 
          subscriptionAttempts++
        }
      }
      subscriptionBilling = subscriptionBilling || {}
      if(!['PAID','PENDING'].includes(subscriptionBilling.state)){
        await paymentService.executeApiPayu('DELETE', `/subscriptions/${subscription.id}`)
      }
      return subscription
    }catch(e){
      throw e
    }
  },

  executeApiPayu: async (method, urlAction, data) => {
    try{
      headersApiPayu.method = method
      headersApiPayu.url = `${process.env.PAYU_API_URL+urlAction}`
      headersApiPayu.data = data
      let response = await axios(headersApiPayu)
      return response.data
    }catch(e){
      throw e
    }
  },

  executeApiPayuQuery: async (method, data) => {
    try{
      headersApiPayu.method = method
      headersApiPayu.url = process.env.PAYU_API_URL_QUERY
      headersApiPayu.data = data
      headersApiPayu.data.merchant = {
        apiLogin: process.env.PAYU_API_LOGIN,
        apiKey: process.env.PAYU_API_KEY
      }
      let response = await axios(headersApiPayu)
      return response.data
    }catch(e){
      throw e
    }
  }

}