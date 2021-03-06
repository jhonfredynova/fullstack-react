/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    active: {
      type: 'boolean',
      defaultsTo: true
    },
    firstname: {
      type: 'string',
      required: true
    },
    lastname: {
      type: 'string',
      required: true
    },
    username: {
      type: 'string',
      unique: true,
      required: true
    },
    email: {
      type: 'string',
      isEmail: true,
      unique: true,
      required: true
    },
    emailConfirmed:{
      type: 'boolean',
      defaultsTo: false
    },
    password: {
      type: 'string'
    },
    passwordResetExpiration: {
      type: 'number',
      allowNull: true
    },
    passwordResetToken: {
      type: 'string',
      allowNull: true
    },
    photo: {
      type: 'string',
      isURL: true,
      defaultsTo: sails.config.app.images.defaultUser
    },
    preferences: {
      type: 'json',
      defaultsTo: {}
    },
    clientCode: {
      type: 'string'
    },
    plan: {
      model: 'plan',
      required: true
    },
    nextPlan: {
      model: 'plan'
    },
    passports: {
      collection: 'passport',
      via: 'user'
    },
    roles: {
      collection: 'rol',
      via: 'users'
    }
  },
  customToJSON: function(){
    this.fullname = `${this.firstname} ${this.lastname}`    
    this.online = socketService.getRoom(socketService.getUserRoomId(this)).length>0
    return _.omit(this, ['password','passwordResetExpiration','passwordResetToken'])
  },
  afterValidate: async function(values){
    try{
      let errors = []
      let data = null
      if(values.email){
        data = await sails.models.user.findOne({ id: { '!=': values.id }, email: values.email })
        if(data) errors.push(intlService.i18n('userEmailAlreadyExist'))
      }
      if(values.username){
        data = await sails.models.user.findOne({ id: { '!=': values.id }, username: values.username })
        if(data) errors.push(intlService.i18n('usernameAlreadyExist'))
      }
      if(errors.length>0){
        errors = errors.join(intlService.i18n('errorSeparator'))
      }
      return errors
    }catch(e){
      throw e
    }
  },
  beforeCreate: async function(values, next){
    try{      
      //validate
      let errors = await this.afterValidate(values)
      if(errors.length>0) throw errors
      //execute
      if(!_.isEmpty(values.email)) values.email = values.email.toLowerCase()
      if(!_.isEmpty(values.username)) values.username = values.username.toLowerCase()
      if(_.isEmpty(values.password)) values.password = Math.random().toString(36).slice(-8)
      if(_.isEmpty(values.plan)) values.plan = sails.config.app.plans.free
      if(_.isEmpty(values.roles)) values.roles = [sails.config.app.roles.registered]
      sails.temp = values.password
      values.password = encryptionService.hashPassword(values.password)
      next()
    }catch(e){
      next(e)
    }
  },
  afterCreate: async function(values, next){
    try{
      //passport
      let passport = await sails.models.passport.findOne({provider: 'bearer', user: values.id})
      if (!passport) {
        passport = {
          protocol: 'local',
          provider: 'bearer',
          identifier: null,
          user: values.id,
          token: encryptionService.createToken(values)
        }
        passport = await sails.models.passport.create(passport)
      }
      //notification
      let responseEmail = await mailService.sendEmail({
        fromName: sails.config.app.appName,
        fromEmail: sails.config.app.emails.noreply,
        toEmail: values.email,
        subject: intlService.i18n('mailWelcomeUserSubject'),
        message: intlService.i18n('mailWelcomeUserMessage', { 
          urlConfirmEmail: `${sails.config.app.appUrl}/register/confirm/${values.id}`,
          urlLogin: `${sails.config.app.appUrl}/login`,
          username: values.email,
          password: sails.temp
        })
      })
      if (!responseEmail) {
        console.error(intlService.i18n('emailError'))
      }
      next()
    }catch(e){
      next(e)
    }
  },
  beforeUpdate: async function(values, next){
    try{
      //validate
      let errors = await this.afterValidate(values)
      if(errors.length>0) throw errors
      //execute
      if(values.password) values.password = encryptionService.hashPassword(values.password)
      next()
    }catch(e){
      next(e)
    }
  }
}

