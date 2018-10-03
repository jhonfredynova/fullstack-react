
module.exports = {

  EVENT: Object.freeze({  
    CONNECT: 'connect',
    CATALOG: 'catalog',
    CHAT: 'chat',
    CHAT_MESSAGE: 'chatmessage',
    LOCALE: 'locale',
    PASSPORT: 'passport',
    PLAN: 'plan',
    PLAN_FEATURE: 'planfeature',
    ROL: 'rol',
    TRANSACTION: 'transaction',
    USER: 'user'
  }),

  login: (req, user) => {
    try{
      sails.sockets.join(req, socketService.getUserRoomId(user))
      sails.sockets.blast(socketService.EVENT.USER, { verb: 'userConnected' })
    }catch(e){
      throw e
    }
  },

  logout: (req, user) => {
    try{
      if(user) sails.sockets.leave(req, socketService.getUserRoomId(user))
      sails.sockets.blast(socketService.EVENT.USER, { verb: 'userDisconnected' })  
    }catch(e){
      throw e
    }
  },

  getRoom: (id) => {
    try{
      let room = sails.io.sockets.adapter.rooms[id] || { sockets: {}, length: 0 }
      return room
    }catch(e){
      throw e
    }
  },

  getUserRoomId: (user) => {
    try{
      return user ? `roomUser${user.id}` : 'anonymous'  
    }catch(e){
      throw e
    }
  }

}