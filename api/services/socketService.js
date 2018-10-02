
module.exports = {

  getRoom: (id) => {
    try{
      let room = sails.io.sockets.adapter.rooms[id] || { sockets: {}, length: 0 }
      return room
    }catch(e){
      return null
    }
  }

}