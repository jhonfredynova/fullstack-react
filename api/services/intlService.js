// packages
let axios = require('axios')
let he = require('he')
let fs = require('fs')
let path = require('path')
const CACHE = {
  INTL: 'CACHE_INTL',
  LOCALES: 'CACHE_LOCALES',
  RATES: 'CACHE_RATES'
}

module.exports = {

  i18n: (locale, args) => {
    locale = sails.__({ phrase: locale, locale: sails.config.i18n.defaultLocale }, args)
    return he.decode(locale)
  },
  
  getIntl: async (args) => {
    try{
      let intl = sails.config.app.appIntl
      //INTL
      let responseIntl = cacheService.get(CACHE.INTL)
      if(!responseIntl){ 
        let sourceIntl = await axios.get(`${process.env.INTL_API_URL}/all?fields=callingCodes;currencies;flag;languages;translations`)
        sourceIntl = sourceIntl.data
        responseIntl = { callingCodes: [], currencies: [], languages: [] }
        //CALLING-CODES
        _.forEach(sourceIntl, item => {
          _.forEach(_.filter(item.callingCodes, item => item), callingCode => {
            responseIntl.callingCodes.push({
              id: parseInt(callingCode, 16),
              flag: item.flag,
              label: `+${callingCode}`,
              value: `+${callingCode}`
            })
          })
        })
        responseIntl.callingCodes = _.sortBy(_.uniq(responseIntl.callingCodes, 'value'), 'id')
        //CURRENCIES
        _.forEach(sourceIntl, item => {
          _.forEach(_.filter(item.currencies, item => (item.code && item.code!=='(none)')), currency => {
            responseIntl.currencies.push({
              flag: item.flag,
              label: currency.code.toUpperCase(),
              value: currency.code.toLowerCase()
            })
          })
        })
        responseIntl.currencies = _.sortBy(_.uniq(responseIntl.currencies, 'value'), 'value')
        //LANGUAGES
        _.forEach(sourceIntl, item => {
          _.forEach(_.filter(item.languages, item => item.iso639_1), language => {
            responseIntl.languages.push({
              flag: item.flag,
              label: language.name,
              value: language.iso639_1
            })
          })
        })
        responseIntl.languages = _.sortBy(_.uniq(responseIntl.languages, 'value'), 'value')
        cacheService.set(CACHE.INTL, responseIntl, 1500)
      }
      intl.callingCodes = responseIntl.callingCodes
      intl.currencies = responseIntl.currencies
      intl.languages = responseIntl.languages
      //LOCALES
      let responseLocales = cacheService.get(CACHE.LOCALES) 
      if(!responseLocales){
        let sourceLocales = await sails.models.locale.find({ active: true })
        responseLocales = {}
        for(let locale of sails.config.app.appLanguages){
          responseLocales[locale] = _.mapValues(_.mapKeys(sourceLocales, 'name'), `value.${locale}`)
          fs.writeFileSync(path.join(__dirname,'../../config/locales',`${locale}.json`), JSON.stringify(responseLocales[locale], null, 2))
        }
        cacheService.set(CACHE.LOCALES, responseLocales, 1500)   
      }
      intl.locales = responseLocales
      //RATES
      let baseCurrency = args.baseCurrency ? args.baseCurrency.toUpperCase() : args.baseCurrency
      let responseRates = cacheService.get(CACHE.RATES) 
      if(!responseRates || (baseCurrency && responseRates[baseCurrency]!==1)){
        responseRates = await axios.get(`${process.env.RATE_API_URL}?access_key=${process.env.RATE_API_KEY}&base=${baseCurrency || 'USD'}`)
        responseRates = responseRates.data.rates
        cacheService.set(CACHE.RATES, responseRates, 1500)      
      }
      intl.currencyConversion = responseRates
      //RETURN
      return intl
    }catch(e){
      return sails.config.app.appIntl
    }
  }

}