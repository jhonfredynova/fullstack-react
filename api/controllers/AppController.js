/**
 * AppController
 *
 * @description :: Server-side logic for managing commons
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

let actionUtil = require('sails/lib/hooks/blueprints/actionUtil')
let axios = require('axios')

module.exports = {

  getIndex: async (req, res, next) => {
    try{
      console.log('----INDEX---')
      if(new RegExp('^/api/(.*)').test(req.url)){
        console.log('----API---')
        return next()
      }
      console.log('----HTML---')
      console.log('----'+sails.config.paths.public+'---')
      res.sendfile('index.html', { root: `${sails.config.paths.public}/build` })
    }catch(e){
      res.serverError(e)
    }
  },

  getConfig: async (req, res) => {
    try{
      let params = await requestService.parseParams(req)
      let response = sails.config.app
      response.appDisabled = JSON.parse(process.env.LOCAL_APP_DISABLED)
      response.appIntl = await intlService.getIntl(params)
      res.ok(response)
    }catch(e){
      res.serverError(e)
    }
  },

  getContact: async (req, res) => {
    try{
      let responseEmail = await mailService.sendEmail({
        fromName: sails.config.app.appName,
        fromEmail: sails.config.app.emailNoreply,
        toEmail: sails.config.app.emailSupport,
        subject: intlService.__('mailContactSubject'),
        message: intlService.__('mailContactMessage', { 
          name: req.body.name, 
          email: req.body.email, 
          phone: req.body.phone, 
          message: req.body.message 
        })
      })
      if (!responseEmail){
        throw new Error(intlService.__('emailError'))
      }
      res.json({ message: intlService.__('emailSuccess') })
    }catch(e){
      res.serverError(e)
    }
  }
	
}

