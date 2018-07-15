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
    if (!user) return res.forbidden('You are not permitted to perform this action.')
    if (!user.active) return res.forbidden('You do not have an active account.')
    req.user = user
    next()
  })(req, res, next)

};