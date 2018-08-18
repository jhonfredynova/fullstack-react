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

  getCreditCardBrand: async (data) => {
    try{
      let response = await stripe.tokens.create({
        card: {
          "number": data.number,
          "exp_month": data.expiration.month,
          "exp_year": data.expiration.year,
          "cvc": data.securityCode
        }
      })
      return response
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