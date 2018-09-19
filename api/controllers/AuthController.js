/**
 * AuthController
 *
 * @description :: Server-side logic for managing catalogs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  me: async (req, res) => {
    if(req.user && req.user.clientCode){
      req.user.clientInfo =  await paymentService.executeApiPayu('GET', `/customers/${req.user.clientCode}`)
    }
    res.ok(req.user)
  },

  login: async (req, res, next) => {
    try{
      let provider = 'bearer'
      let user = await sails.models.user.findOne({ or: [{email: req.body.username}, {username: req.body.username}] }).populateAll()
      if (!user){
        throw intlService.i18n('usernameNotFound')
      }
      let passport = _.find(user.passports, { provider: provider })
      if (!passport) {
        throw intlService.i18n('userNotHaveLocalPassport')
      }
      if (!encryptionService.comparePassword(req.body.password, user.password)){
        throw intlService.i18n('passwordIncorrect')
      }
      if (!user.active) {
        throw intlService.i18n('userInactive')
      }
      user.currentPassport = passport
      res.json(user)
    }catch(e){
      res.badRequest(e)
    }
  },

  register: async (req, res, next) => {
    try{
      let user = req.body
      user = await sails.models.user.create(user)
      user = await sails.models.user.findOne({ id: user.id }).populateAll()
      user.currentPassport = _.find(user.passports, { provider: 'bearer' })
      res.json(user)
    }catch(e){
      res.badRequest(e)
    }
  },

  provider: async (req, res, next) => {
    passportService.authenticate(req.param('provider'), { scope : ['email'] })(req, res, next)
  },

  providerAction: async (req, res, next) => {
    res.ok('Ok')
  },

  providerCallback: async (req, res, next) => {
    passportService.authenticate(req.param('provider'), { failureRedirect: `${process.env.LOCAL_APP_URL}/login` }, function(err, user, info){
      if (err) return res.badRequest(err)
      res.redirect(`${process.env.LOCAL_APP_URL}/login/${user.currentPassport.provider}/${user.currentPassport.token}`)
    })(req, res, next)
  }
  
}