module.exports.passport = {
  bearer: {
    name: 'bearer',
    protocol: 'bearer',
    strategy: require('passport-http-bearer').Strategy
  },
  facebook: {
    name: 'facebook-token',
    protocol: 'oauth2',
    strategy: require('passport-facebook'),
    strategyToken: require('passport-facebook-token'),
    options: {
      clientID: process.env.PASSPORT_FACEBOOK_CLIENT_ID,
      clientSecret: process.env.PASSPORT_FACEBOOK_CLIENT_SECRET,
      callbackURL: `${process.env.LOCAL_API_URL}/auth/facebook/callback`,
      profileFields: ['emails', 'name', 'picture.type(large)']
    }
  },
  google: {
    name: 'google-plus-token',
    protocol: 'oauth2',
    strategy: require('passport-google-oauth20').Strategy,
    strategyToken: require('passport-google-plus-token'),
    options: {
      clientID: process.env.PASSPORT_GOOGLE_CLIENT_ID,
      clientSecret: process.env.PASSPORT_GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.LOCAL_API_URL}/auth/google/callback`,
      scope: ['profile', 'email']
    }
  }
}