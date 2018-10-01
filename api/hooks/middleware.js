/**
 * middlewareHook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: http://sailsjs.com/docs/concepts/extending-sails/hooks
 */

module.exports = function socketRequest(sails) {

  return {
    initialize: function (done) {
      sails.log.debug('Initializing middleware hook (`socketRequest`)')
      return done()
    },
    routes:{
      before: {
        'all /*': {
          skipAssets: true,
          fn: async (req, res, next) => {
            //config
            const { app } = sails.config
            app.appPreferences.currency = _.get(req.headers, 'accept-currency', app.appPreferences.currency)
            app.appPreferences.language = _.get(req.headers, 'accept-language', app.appPreferences.language)      
            app.appDisabled = JSON.parse(process.env.LOCAL_APP_DISABLED)
            app.appIntl = await intlService.getIntl()
            //session
            let authorizationStrategy = req.headers['authorization'] ? req.headers['authorization'].split(' ')[0] : null
            let authorizationToken = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null  
            if(!_.find(sails.config.passport, item => item.name===authorizationStrategy)) return next()
            if(!authorizationStrategy || !authorizationToken) return next()
            switch(authorizationStrategy.toLowerCase()){
              case 'bearer':
                req.headers['authorization'] = `Bearer ${authorizationToken}`
                break
              case 'facebook-token':
                req.headers['authorization'] = `Bearer ${authorizationToken}`
                break
              case 'google-plus-token':
                req.query.access_token = authorizationToken
                break
            }
            passportService.authenticate(authorizationStrategy, { session: false }, async (err, user, info) => {
              try{
                if (err) return next(err)
                if (!user) return next()
                if (!user.active) return next()
                user = await sails.models.user.findOne(user.id).populateAll()
                const { plans, roles } = sails.config.app
                let permissions = {
                  isPlanFree: user.plan.id===plans.free,
                  isPlanPremium: user.plan.id===plans.premium,
                  isPlanStandard: user.plan.id===plans.standard,
                  isRolAdmin: user.roles.find(item => item.id===roles.admin) ? true : false,
                  isRolRegistered: user.roles.find(item => item.id===roles.registered) ? true : false
                }
                const { isPlanFree, isPlanPremium, isPlanStandard, isRolAdmin, isRolRegistered } = permissions
                user.permissions = []
                if(isRolAdmin) user.permissions.push(1)
                if(isRolRegistered && isPlanPremium) user.permissions.push(2)
                if(isRolRegistered && isPlanStandard) user.permissions.push(3)
                if(isRolRegistered && isPlanFree) user.permissions.push(4)
                req.user = user
                next()
              }catch(e){
                res.badRequest(e)
              }
            })(req, res, next)
          }
        }
      }
    }
  }
  
}