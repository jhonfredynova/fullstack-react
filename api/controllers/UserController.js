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
      let user = await sails.models.user.findOne({ $or: [{email: req.body.username}, {username: req.body.username}] }).populateAll()
      if (!user) {
        throw intlService.i18n('usernameNotFound')
      }
      let passport = _.find(user.passports, { provider: 'bearer' })
      if (!passport) {
        throw intlService.i18n('userNotHaveLocalPassport')
      }
      user.passwordResetExpiration = new Date(Date.now()+3600000)//Valid for 1 hour
      user.passwordResetToken = crypto.randomBytes(20).toString('hex')
      await user.save()
      //notification
      let responseEmail = await mailService.sendEmail({
        fromName: sails.config.app.appName,
        fromEmail: sails.config.app.emails.noreply,
        toEmail: user.email,
        subject: intlService.i18n('mailForgotAccountSubject'),
        message: intlService.i18n('mailForgotAccountMessage', { url: `${sails.config.app.appUrl}/reset-account/${user.passwordResetToken}` })
      })
      if (!responseEmail){
        throw intlService.i18n('emailError')
      }
      res.json({ message: intlService.i18n('userRecoveryAccountSuccess') })
    }catch(e){
      res.badRequest(e)
    }
  },

  reset: async (req, res, next) => {
    try{
      let user = await sails.models.user.findOne({ passwordResetToken: req.params.token, passwordResetExpiration: { $gt: new Date(Date.now()) } })
      if (!user){ 
        throw intlService.i18n('userResetError')
      }
      if (!req.body.password) {
        throw intlService.i18n('userResetPasswordEmpty')
      }
      user.password = req.body.password
      user.passwordResetExpiration = null
      user.passwordResetToken = null
      user = await user.save()
      res.json({ message: intlService.i18n('userResetSuccess') })
    }catch(e){
      res.badRequest(e)
    }
  },

  validate: async (req, res) => {
    try{
      let user = await sails.models.user.findOne({ id: req.param('token') })
      if (!user) {
        throw intlService.i18n('userValidateEmailError')
      }
      user.emailConfirmed = true
      await user.save()
      res.json({ message: intlService.i18n('userValidateEmailSuccess') })
    }catch(e){
      res.badRequest(e)
    }
  }

}

