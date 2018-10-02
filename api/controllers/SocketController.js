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
      let roomName = req.user ? `user-${req.user.id}` : 'anonymous'
      sails.sockets.join(req, roomName)
      sails.sockets.blast('user', { verb: 'userConnected' })  
      req.socket.on('disconnect', () => {
        sails.sockets.blast('user', { verb: 'userDisconnected' })  
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