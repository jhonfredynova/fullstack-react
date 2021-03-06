/*******************************************************
// local configuration
*******************************************************/
try{
  require('dotenv').load()
  require('./local')
}catch (e){
  console.warn('Warning: local configuration not found')
}

/*******************************************************
// app configuration
*******************************************************/
module.exports.app = {
  //APP
  appDisabled: false,
  appIntl: {
    callingCodes: [],
    currencies: [],
    currencyConversion: {},
    languages: [],
    locales: {}
  },
  appLanguages: ['en','es'],
  appLogo: 'https://s3.amazonaws.com/tucode/tucode.png',
  appName: 'TuCode',
  appPreferences: {
    adminPagination: 10,
    currency: 'usd',
    language: 'en'
  },
  appUrl: process.env.LOCAL_APP_URL,
  //CATALOGS
  catalogs: {
    planFeatures: '5b4ccb5e0af99032b213489b',
    txtDocs: '5b4ccad70af99032b213489a',
    txtFAQ: '5b4ccad70af99032b213489a',
    txtPrivacy: '5b4ccad70af99032b213489a',
    txtTerms: '5b4ccad70af99032b213489a'
  },
  //EMAILS
  emails: {
    noreply: 'noreply@tucode.com',
    support: 'jhonfredynova@gmail.com'
  },
  //IMAGES
  images: {
    defaultCompany: 'https://s3.amazonaws.com/tucode/defaults/company.png',
    defaultUser: 'https://s3.amazonaws.com/tucode/defaults/user.png'
  },
  //PLANS
  plans: {
    free: '5b4cce080af99032b21348a8',
    premium: '5b4cce650af99032b21348aa',
    standard: '5b4cce380af99032b21348a9',
    subscriptions: ['tucode-plan-standard','tucode-plan-premium']
  },
  //ROLES
  roles: {
    admin: '56507b29adc2d7c703be31fc',
    registered: '56400a2b1b668b080243d2d7',
  },
  //SOCIAL
  social: {
    facebook: 'https://www.facebook.com/jhonfredynova',
    google: 'https://plus.google.com/+jhonfredynova',
    linkedin: 'https://www.linkedin.com/co/jhonfredynova',
    supportForum: 'https://plus.google.com/+jhonfredynova',
    twitter: 'https://www.twitter.com/jhonfredynova',
    youtube: 'https://www.youtube.com/jhonfredynova'
  }
}