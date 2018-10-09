/**
 * middlewareHook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: http://sailsjs.com/docs/concepts/extending-sails/hooks
 */

module.exports = function socketRequest(sails) {

  return {
    initialize: function (done) {
      sails.log.debug('Initializing middleware hook (`socketRequest`)')
      return done()
    },
    routes:{
      before: {
        'all /*': {
          skipAssets: true,
          fn: async (req, res, next) => {
            const { app } = sails.config
            app.appPreferences.currency = _.get(req.headers, 'accept-currency', app.appPreferences.currency)
            app.appPreferences.language = _.get(req.headers, 'accept-language', app.appPreferences.language)      
            app.appDisabled = JSON.parse(process.env.LOCAL_APP_DISABLED)
            app.appIntl = await intlService.getIntl()
            next()
          }
        }
      }
    }
  }
  
}