/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

let crypto = require('crypto'),
fs = require('fs')

module.exports = {

	forgot: async (req, res, next) => {
    try{
      let user = await sails.models.user.findOne({ $or: [{email: new RegExp(`^${req.body.username}$`, 'i')}, {username: new RegExp(`^${req.body.username}$`, 'i')}] }).populateAll()
      if (!user) {
        throw new Error(intlService.__('usernameNotFound'))
      }
      let passport = _.find(user.passports, { provider: 'bearer' })
      if (!passport) {
        throw new Error(intlService.__('userNotHaveLocalPassport'))  
      }
      user.passwordResetExpiration = new Date(Date.now()+3600000)//Valid for 1 hour
      user.passwordResetToken = crypto.randomBytes(20).toString('hex')
      await user.save()
      //notification
      let responseEmail = await mailService.sendEmail({
        fromName: sails.config.app.appName,
        fromEmail: sails.config.app.emailNoreply,
        toEmail: user.email,
        subject: intlService.__('mailForgotAccountSubject'),
        message: intlService.__('mailForgotAccountMessage', { url: `${sails.config.app.appUrl}/reset-account/${user.passwordResetToken}` })
      })
      if (!responseEmail){
        throw new Error(intlService.__('emailError'))
      }
      res.json({ message: intlService.__('userRecoveryAccountSuccess') })
    }catch(e){
      res.negotiate(e)
    }
  },

  reset: async (req, res, next) => {
    try{
      let user = await sails.models.user.findOne({ passwordResetToken: req.params.token, passwordResetExpiration: { $gt: new Date(Date.now()) } })
      if (!user){ 
        throw new Error(intlService.__('userResetError'))
      }
      if (!req.body.password) {
        throw new Error(intlService.__('userResetPasswordEmpty'))
      }
      user.password = req.body.password
      user.passwordResetExpiration = null
      user.passwordResetToken = null
      user = await user.save()
      res.json({ message: intlService.__('userResetSuccess') })
    }catch(e){
      res.negotiate(e)
    }
  },

  validate: async (req, res) => {
    try{
      let user = await sails.models.user.findOne({ id: req.param('token') })
      if (!user) {
        throw new Error(intlService.__('userValidateEmailError'))
      }
      user.emailConfirmed = true
      await user.save()
      res.json({ message: intlService.__('userValidateEmailSuccess') })
    }catch(e){
      res.negotiate(e)
    }
  }

}

