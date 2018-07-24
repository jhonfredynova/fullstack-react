/**
 * Passport Middleware
 *
 * For more information on the Passport.js middleware, check out:
 * http://passportjs.org/guide/configure/
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */

module.exports = async function (req, res, next) {  

  let authorizationStrategy = req.headers['authorization'] ? req.headers['authorization'].split(' ')[0] : null
  let authorizationToken = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null  

  if (!_.find(sails.config.passport, item => item.name===authorizationStrategy)) {
    return res.forbidden(intlService.__('authStrategyNotAvailable'))
  }

  if (!authorizationStrategy || !authorizationToken) {
    return res.forbidden(intlService.__('authStrategyNotProvided'))
  }

  switch(authorizationStrategy){
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
      if (!user) return res.forbidden(intlService.__('authStrategyFailed'))
      if (!user.active) return res.forbidden(intlService.__('userInactive'))
      user = await sails.models.user.findOne(user.id).populateAll()
      const { plans, roles } = sails.config.app
      let permissions = {
        isPlanFree: user.planInfo.plan===plans.free,
        isPlanPremium: user.planInfo.plan===plans.premium,
        isPlanStandard: user.planInfo.plan===plans.standard,
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
      res.negotiate(e)
    }
  })(req, res, next)

}