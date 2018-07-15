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
      required: true,
      defaultsTo: true
    },
    username: {
      type: 'string',
      index: true,
      unique: true
    },
    email: {
      type: 'email',
      index: true,
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
      type: 'datetime'
    },
    passwordResetToken: {
      type: 'string'
    },
    photo: {
      type: 'string',
      url: true
    },
    firstname: {
      type: 'string'
    },
    lastname: {
      type: 'string'
    },
    passports: {
      collection: 'passport',
      via: 'user'
    },
    roles: {
      collection: 'rol',
      via: 'users',
      defaultsTo: [sails.config.app.rolRegistered]
    },
    preferences: {
      type: 'json',
      defaultsTo: []
    },
    clientCode: {
      type: 'string'
    },
    getFullName: () => {
      return `${this.firstname} ${this.lastname}`
    }
  },
  afterFind: async function(values){
    try{
      values = _.map(values, item => {
        delete item.password
        delete item.passwordResetExpiration
        delete item.passwordResetToken
        return item
      })
      return values
    }catch(e){
      return values
    }
  },
  afterValidate: async (values, cb) => {
    try{
      if(values.email) values.email = values.email.toLowerCase()
      if(values.username) values.username = values.username.toLowerCase()
      let errors = []
      let data = await User.findOne().where({ id: { '!': values.id }, email: values.email })
      if(data){
        errors.push(intlService.__('userEmailAlreadyExist'))
      }
      data = await User.findOne().where({ id: { '!': values.id }, username: values.username })
      if(data){
        errors.push(intlService.__('usernameAlreadyExist'))
      }
      if(errors.length>0){
        throw new Error(errors.join(intlService.__('errorSeparator')))
      }
      cb()
    }catch(e){
      cb(e)
    }
  },
  beforeCreate: async (values, cb) => {
    try{      
      if(polyfillService.isEmpty(values.password)) values.password = Math.random().toString(36).slice(-8)
      sails.temp = values.password
      values.password = cipherService.hashPassword(values.password)
      cb()
    }catch(e){
      cb(e)
    }
  },
  afterCreate: async (values, cb) => {
    try{
      //creating passport
      let passport = await sails.models.passport.findOne({provider: 'bearer', user: values.id})
      if (!passport) {
        passport = {
          protocol: 'local',
          provider: 'bearer',
          identifier: null,
          user: values.id,
          token: cipherService.createToken(values)
        }
        passport = await sails.models.passport.create(passport)
      }
      //send notification
      let responseEmail = await mailService.sendEmail({
        fromName: sails.config.app.appName,
        fromEmail: sails.config.app.emailNoreply,
        toEmail: values.email,
        subject: intlService.__('mailWelcomeUserSubject'),
        message: intlService.__('mailWelcomeUserMessage', { 
          urlConfirmEmail: `${sails.config.app.appUrl}/register/confirm/${values.id}`,
          urlLogin: `${sails.config.app.appUrl}/login`,
          username: values.email,
          password: sails.temp
        })
      })
      if (!responseEmail) {
        console.error(intlService.__('emailError'))
      }
      //response
      cb()
    }catch(e){
      cb(e)
    }
  },
  beforeUpdate: async (values, cb) => {
    try{
      if(values.password) values.password = cipherService.hashPassword(values.password)
      cb()
    }catch(e){
      cb(e)
    }
  }
}

