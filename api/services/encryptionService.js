var bcrypt = require('bcrypt-nodejs'),
jwt = require('jsonwebtoken')
 
module.exports = {

  hashPassword: (password) => {
    if(!password || password.length>=60) return password
    return bcrypt.hashSync(password)
  },

  comparePassword: (password, hash) => {
    if(!password || !hash) return false
    return bcrypt.compareSync(password, hash)
  },

  createToken: (data) => {
    return jwt.sign({data: data}, sails.config.session.secret, {
      algorithm: "HS256",
      expiresIn: 60*24
    })
  }

}