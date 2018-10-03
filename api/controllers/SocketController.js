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
      let user = req.user
      socketService.login(req, user) 
      req.socket.on('disconnect', () => {
        socketService.logout(req, null) 
      })
      res.ok()
    }catch(e){
      res.badRequest(e)
    }
  },

  subscribe: (req, res) => {
    try{
      if(!req.isSocket) return res.badRequest()
      sails.sockets.join(req, req.param('room'))
      res.ok()
    }catch(e){
      res.badRequest(e)
    }
  }
    
}