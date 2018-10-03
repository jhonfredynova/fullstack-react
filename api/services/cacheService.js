let cache = require('memory-cache')

module.exports = {

  KEY: Object.freeze({   
    INTL: 'CACHE_INTL',
    LOCALES: 'CACHE_LOCALES',
    PAYU: 'CACHE_PAYU',
    RATES: 'CACHE_RATES',
    STRIPE: 'CACHE_STRIPE'
  }),

  get: (key) => {
    try{
      return cache.get(key)
    }catch(e){
      return null
    }
  },

  set: (key, value, minutes) => {
    try{
      return cache.put(key, value, (60*1000)*minutes)
    }catch(e){
      return null
    }
  },

  delete: (key) => {
    try{
      return cache.del(key)
    }catch(e){
      return false
    }
  }

}