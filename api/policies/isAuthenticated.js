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
    return res.forbidden('The authorization strategy not is available.')
  }

  if (!authorizationStrategy || !authorizationToken) {
    return res.forbidden('You have not provided authorization strategy or authorization token.')
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

  passportService.authenticate(authorizationStrategy, { session: false }, function(err, user, info) {
    if (err) return next(err)
    if (!user) return res.forbidden(intlService.__('authNotLogin'))
    if (!user.active) return res.forbidden(intlService.__('userInactive'))
    let permissions = {
      isPlanFree: user.plan===sails.config.app.planFree,
      isPlanPremium: user.plan===sails.config.app.planPremium,
      isPlanStandard: user.plan===sails.config.app.planStandard,
      isRolAdmin: Object.isEmpty(user.roles.find(item => item===sails.config.app.rolAdmin)),
      isRolRegistered: Object.isEmpty(user.roles.find(item => item===sails.config.app.rolRegistered))
    }
    const { isPlanFree, isPlanPremium, isPlanStandard, isRolAdmin, isRolRegistered } = permissions
    user.permissions = {
      level1: (isRolAdmin),
      level2: (isRolRegistered && isPlanPremium),
      level3: (isRolRegistered && isPlanStandard),
      level4: (isRolRegistered && isPlanFree)
    }
    req.user = user
    next()
  })(req, res, next)

}