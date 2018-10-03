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
      sails.log('PAYMENT-SERVICE: OK0')
      let subscription = await paymentService.executeApiPayu('POST', `/subscriptions`, data)
      sails.log('PAYMENT-SERVICE: OK1')
      if(!subscription){
        throw intlService.i18n('subscriptionCreatedErrorCard')
      }
      return subscription      
    }catch(e){
      sails.log('PAYMENT-SERVICE: CREATE-SUBSCRIPTION')
      sails.log(e)
      sails.log(e.message)
      throw e
    }
  },

  executeApiPayu: async (method, urlAction, data) => {
    try{
      sails.log('EXECUTE-PAYU: '+process.env.PAYU_API_URL)
      headersApiPayu.method = method
      headersApiPayu.url = `${process.env.PAYU_API_URL+urlAction}`
      headersApiPayu.data = data
      sails.log('EXECUTE-PAYU: OK001')
      let response = await axios(headersApiPayu)
      return response.data
    }catch(e){
      sails.log('EXECUTE-PAYU: CREATE-SUBSCRIPTION')
      sails.log(e)
      sails.log(e.message)
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