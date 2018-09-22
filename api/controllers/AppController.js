/**
 * AppController
 *
 * @description :: Server-side logic for managing commons
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

let actionUtil = require('sails/lib/hooks/blueprints/actionUtil')
let axios = require('axios')

module.exports = {

  getIndex: async (req, res) => {
    try{
      if(!req.isSocket){
        res.sendFile('index.html', { root: `${sails.config.paths.public}/build` })
      }
    }catch(e){
      res.badRequest(e)
    }
  },

  getConfig: async (req, res) => {
    try{
      if(req.isSocket){
        const { app } = sails.config
        app.appPreferences.currency = _.get(req.headers, 'accept-currency', app.appPreferences.currency)
        app.appPreferences.language = _.get(req.headers, 'accept-language', app.appPreferences.language)      
        app.appDisabled = JSON.parse(process.env.LOCAL_APP_DISABLED)
        app.appIntl = await intlService.getIntl()
      }
      res.ok(sails.config.app)
    }catch(e){
      res.badRequest(e)
    }
  },

  getContact: async (req, res) => {
    try{
      let responseEmail = await mailService.sendEmail({
        fromName: sails.config.app.appName,
        fromEmail: sails.config.app.emails.noreply,
        toEmail: sails.config.app.emails.support,
        subject: intlService.i18n('mailContactSubject'),
        message: intlService.i18n('mailContactMessage', { 
          name: req.body.name, 
          email: req.body.email, 
          phone: req.body.phone, 
          message: req.body.message 
        })
      })
      if (!responseEmail){
        throw intlService.i18n('emailError')
      }
      res.ok({ message: intlService.i18n('emailSuccess') })
    }catch(e){
      res.badRequest(e)
    }
  }
	
}

