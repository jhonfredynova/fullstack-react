let passport = require('passport'),
passportConfig = sails.config.passport

let callbackProviderStrategy = async (token, refreshToken, profile, next) => {
  try{
    //create user
    let user = await sails.models.user.findOne({ email: new RegExp(`^${profile.emails[0].value}$`, 'i') })
    if (!user) {
      user = {}
      if (profile.username) {
        user.username = profile.username
      }
      if (profile.emails && profile.emails[0] && profile.emails[0].value) {
        user.email = profile.emails[0].value.toLowerCase()
        user.username = user.username || user.email.split('@')[0]
      }
      if (profile.name && profile.name.givenName) {
        user.firstname = profile.name.givenName
      }
      if (profile.name && profile.name.familyName) {
        user.lastname = profile.name.familyName
      }
      if (profile.photos && profile.photos[0] && profile.photos[0].value) {
        user.photo = profile.photos[0].value
      }
      if (!user.username && !user.email) {
        throw 'Cannot create user, neither exist email nor username.'
      }
      let usernameTaken= await sails.models.user.findOne({ username: new RegExp(`^${user.username}$`, 'i') })
      user.username = usernameTaken ? '' : user.username
      user = await sails.models.user.create(user)
    }
    //create passport
    let passport = await sails.models.passport.findOne({identifier: profile.id, user: user.id})
    if (!passport) {
      passport = {
        protocol: passportConfig[profile.provider].protocol,
        provider: passportConfig[profile.provider].name,
        identifier: profile.id,
        user: user.id,
        token: token
      }
      passport = await sails.models.passport.create(passport)
    }
    //response
    user = await sails.models.user.findOne({ id: user.id })
    passport = await sails.models.passport.findOne({ provider: 'bearer' })
    user.currentPassport = passport
    next(null, user)
  }catch(e){
    next(e, null)
  }
}

//BEARER
passport.use(new passportConfig.bearer.strategy(async (token, next) => {
  try{
    let passport = await sails.models.passport.findOne({ provider: 'bearer', token: token })
    if (!passport) return next(null, false)
    let user = await sails.models.user.findOne({ id: passport.user })
    user.currentPassport = passport
    next(null, user)
  }catch(e){
    next(e)
  }
})),

//FACEBOOK
passport.use(new passportConfig.facebook.strategy({
  clientID: passportConfig.facebook.options.clientID,
  clientSecret: passportConfig.facebook.options.clientSecret,
  callbackURL: passportConfig.facebook.options.callbackURL,
  profileFields: passportConfig.facebook.options.profileFields
}, callbackProviderStrategy))

passport.use(new passportConfig.facebook.strategyToken({
  clientID: passportConfig.facebook.options.clientID,
  clientSecret: passportConfig.facebook.options.clientSecret
}, callbackProviderStrategy))

//GOOGLE
passport.use(new passportConfig.google.strategy({
  clientID: passportConfig.google.options.clientID,
  clientSecret: passportConfig.google.options.clientSecret,
  callbackURL: passportConfig.google.options.callbackURL
}, callbackProviderStrategy))

passport.use(new passportConfig.google.strategyToken({
  clientID: passportConfig.google.options.clientID,
  clientSecret: passportConfig.google.options.clientSecret
}, callbackProviderStrategy))

// Configuring passport functions
passport.serializeUser(async (user, next) => {
  next(null, user.id)
})

passport.deserializeUser(async (id, next) => {
  try{
    let user = await sails.models.user.findOne(id)
    next(null, user || null)
  }catch(e){
    next(e, null)
  }
})

module.exports = passport