/**
 * Session Policy
 *
 * For more information on the Passport.js middleware, check out:
 * http://passportjs.org/guide/configure/
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */

module.exports = async function (req, res, next) {  
  if(!req.user){
    return res.forbidden()
  }
  next()
}