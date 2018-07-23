module.exports = async function (req, res, next) {  
  if(!req.user){
    return res.forbidden(intlService.__('authNotLogin'))
  }
  if(!req.user.permissions.level4){
    return res.forbidden(intlService.__('authNotPriviliges'))
  }
  next()
}