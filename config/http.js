/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */

module.exports.http = {

  /****************************************************************************
  *                                                                           *
  * Sails/Express middleware to run for every HTTP request.                   *
  * (Only applies to HTTP requests -- not virtual WebSocket requests.)        *
  *                                                                           *
  * https://sailsjs.com/documentation/concepts/middleware                     *
  *                                                                           *
  ****************************************************************************/

  middleware: {

    /***************************************************************************
    *                                                                          *
    * The order in which middleware should be run for HTTP requests.           *
    * (This Sails app's routes are handled by the "router" middleware below.)  *
    *                                                                          *
    ***************************************************************************/

    order: [
      'forceDomain',
      'forceIntl',
      'forceLanguage',
      'cookieParser',
      'session',
      'bodyParser',
      'compress',
      'poweredBy',
      'router',
      'www',
      'favicon',
    ],


    /***************************************************************************
    *                                                                          *
    * The body parser that will handle incoming multipart HTTP requests.       *
    *                                                                          *
    * https://sailsjs.com/config/http#?customizing-the-body-parser             *
    *                                                                          *
    ***************************************************************************/

    forceDomain: async (req, res, next) => {
      require('forcedomain')({ 
        hostname: process.env.LOCAL_DOMAIN,
        protocol: 'https' 
      })(req, res, next)
    },

    forceIntl: async (req, res, next) => {
      const { app } = sails.config
      app.appDisabled = JSON.parse(process.env.LOCAL_APP_DISABLED)
      app.appIntl = await intlService.getIntl(req.query)
      next()
    },

    forceLanguage: async (req, res, next) => {
      let language = req.headers['accept-language']
      if(language) sails.config.i18n.defaultLocale = language
      next()
    },    

    // bodyParser: (function _configureBodyParser(){
    //   var skipper = require('skipper');
    //   var middlewareFn = skipper({ strict: true });
    //   return middlewareFn;
    // })(),

  },

};
