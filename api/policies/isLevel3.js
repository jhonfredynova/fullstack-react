module.exports = async function (req, res, next) {  
  if(!req.user){
    return res.forbidden(intlService.__('authNotLogin'))
  }
  if(!req.user.permissions.level3){
    return res.forbidden(intlService.__('authNotPriviliges'))
  }
  next()
}