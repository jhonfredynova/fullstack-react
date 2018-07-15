let fs = require('fs'),
axios = require('axios'),
headersApiPayu = {
  url: process.env.PAYU_API_URL,
  headers: {
    'Authorization': `Basic ${Buffer.from(`${process.env.PAYU_API_LOGIN}:${process.env.PAYU_API_KEY}`).toString('base64')}`,
    'Accept': 'Application/json'
  }
}

module.exports = {

  checkCreditCard: async (data) => {
    try{
      return await stripe.tokens.create({
        card: {
          "number": data.number,
          "exp_month": data.expMonth,
          "exp_year": data.expYear,
          "cvc": data.cvc
        }
      })
    }catch(e){
      return new Error(errorMessagesStripe[e.code])
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