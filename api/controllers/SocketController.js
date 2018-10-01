/**
 * SocketController
 *
 * @description :: Server-side logic for managing catalogs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  connect: (req, res) => {
    try{
      if(!req.isSocket) return res.badRequest()
      let roomName = req.user ? req.user.username : 'anonymous'
      //sails.sockets.join(req, roomName)
      res.ok()
    }catch(e){
      res.badRequest(e)
    }
  },

  disconnect: (req, res) => {
    try{
      if(!req.isSocket) return res.badRequest()
      res.ok()
    }catch(e){
      res.badRequest(e)
    }
  }
  
}