/**
 * AuthController
 *
 * @description :: Server-side logic for managing catalogs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  me: async (req, res) => {
    res.ok(req.user)
  },

  login: async (req, res, next) => {
    try{
      let provider = 'bearer'
      let user = await sails.models.user.findOne({ $or: [ {email: new RegExp(`^${req.body.username}$`, 'i')}, {username: new RegExp(`^${req.body.username}$`, 'i')} ] }).populateAll()
      if (!user){
        throw new Error(intlService.__('usernameNotFound'))
      }
      let passport = _.find(user.passports, { provider: provider })
      if (!passport) {
        throw new Error(intlService.__('userNotHaveLocalPassport'))  
      }
      if (!cipherService.comparePassword(req.body.password, user.password)){
        throw new Error(intlService.__('passwordIncorrect'))
      }
      if (!user.active) {
        throw new Error(intlService.__('userInactive'))
      }
      user.currentPassport = passport
      res.json(user)
    }catch(e){
      res.negotiate(e)
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
      res.negotiate(e)
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
  
};