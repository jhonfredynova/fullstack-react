let axios = require('axios')
let fs = require('fs')
let path = require('path')
const CACHE = {
  INTL: 'CACHE_INTL',
  RATES: 'CACHE_RATES'
}

module.exports = {
  
  __: (phrase, args) => {
    return sails.__({ phrase: phrase, locale: sails.config.i18n.defaultLocale }, args)
  },
  
  getIntl: async (params) => {
    let intl = { callingCodes: [], currencies: [], currencyConversion: [], languages: [], locales: {} }
    try{
      //INTL
      let responseIntl = cacheService.get(CACHE.INTL) 
      if(!responseIntl){
        responseIntl = await axios.get(`${process.env.INTL_API_URL}/all?fields=callingCodes;currencies;flag;languages;translations`)
        responseIntl = responseIntl.data
        cacheService.set(CACHE.INTL, responseIntl, 1500)      
      }
      //CALLING-CODES
      _.forEach(responseIntl, item => {
        _.forEach(_.filter(item.callingCodes, item => item), callingCode => {
          intl.callingCodes.push({
            id: parseInt(callingCode, 16),
            flag: item.flag,
            label: `+${callingCode}`,
            value: `+${callingCode}`
          })
        })
      })
      intl.callingCodes = _.sortBy(_.uniq(intl.callingCodes, 'value'), 'id')
      //CURRENCIES
      _.forEach(responseIntl, item => {
        _.forEach(_.filter(item.currencies, item => (item.code && item.code!=='(none)')), currency => {
          intl.currencies.push({
            flag: item.flag,
            label: currency.code.toUpperCase(),
            value: currency.code.toLowerCase()
          })
        })
      })
      intl.currencies = _.sortBy(_.uniq(intl.currencies, 'value'), 'value')
      //LANGUAGES
      _.forEach(responseIntl, item => {
        _.forEach(_.filter(item.languages, item => item.iso639_1), language => {
          intl.languages.push({
            flag: item.flag,
            label: language.name,
            value: language.iso639_1
          })
        })
      })
      intl.languages = _.sortBy(_.uniq(intl.languages, 'value'), 'value')
      //LOCALES
      let responseLocales = await sails.models.locale.find({ active: true }) 
      responseLocales = _.map(responseLocales, item => item.toJSON()) 
      for (let locale of sails.config.app.appLanguages){
        intl.locales[locale] = _.mapValues(_.mapKeys(responseLocales, 'name'), `value.${locale}`)
        fs.writeFileSync(path.join(__dirname,'../../config/locales',`${locale}.json`), JSON.stringify(intl.locales[locale], null, 2))
      }
      //RATES
      params.baseCurrency = params.baseCurrency || 'USD'
      params.baseCurrency = params.baseCurrency.toUpperCase()
      let responseRates = cacheService.get(CACHE.RATES) 
      if(!responseRates || responseRates[params.baseCurrency]!==1){
        responseRates = await axios.get(`${process.env.RATE_API_URL}?access_key=${process.env.RATE_API_KEY}&base=${params.baseCurrency}`)
        responseRates = responseRates.data.rates
        cacheService.set(CACHE.RATES, responseRates, 1500)      
      }
      intl.currencyConversion = responseRates
      //RETURN
      return intl
    }catch(e){
      return intl
    }
  }

}