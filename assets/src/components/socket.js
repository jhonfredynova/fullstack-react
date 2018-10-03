import sailsIOClient from 'sails.io.js'
import socketIOClient from 'socket.io-client'

function Socket(params){
  let io = sailsIOClient(socketIOClient)
  Object.keys(params).map(key => (io.sails[key] = params[key]))

  let parseResponse = (resolve, reject, response) => {
    if(response.statusCode<200 || response.statusCode>=400) return reject(response)
    response.data = response.body
    resolve(response)
  }

  let parseUrl = (url) => {
    return url.replace(process.env.REACT_APP_LOCAL_SOCKET_URL, '')
  }

  this.setHeader = (headers) => {
    io.socket.headers = headers
  }

  this.get = (url, data) => {
    return new Promise((resolve, reject) => {
      io.socket.get(parseUrl(url), data, (body, jwr) => parseResponse(resolve, reject, jwr))
    })
  }

  this.post = (url, data) => {
    return new Promise((resolve, reject) => {
      io.socket.post(parseUrl(url), data, (body, jwr) => parseResponse(resolve, reject, jwr))
    })
  }
  
  this.put = (url, data) => {
    return new Promise((resolve, reject) => {
      io.socket.put(parseUrl(url), data, (body, jwr) => parseResponse(resolve, reject, jwr))
    })
  }
  
  this.patch = (url, data) => {
    return new Promise((resolve, reject) => {
      io.socket.patch(parseUrl(url), data, (body, jwr) => parseResponse(resolve, reject, jwr))
    })
  }

  this.delete = (url, data) => {
    return new Promise((resolve, reject) => {
      io.socket.delete(parseUrl(url), data, (body, jwr) => parseResponse(resolve, reject, jwr))
    })
  }

  this.on = (event, callback) => {
    return new Promise(resolve => {
      io.socket.on(event, (data) => {
        callback(data)
        resolve(data)
      })
    })
  }

  this.off = (event, callback) => {
    return new Promise(resolve => {
      io.socket.off(event, (data) => {
        callback(data)
        resolve(data)
      })
    })
  }
}

const socket = new Socket({ 
  autoConnect: true,
  url: process.env.REACT_APP_LOCAL_SOCKET_URL,
  useCORSRouteToGetCookie: false
})

export default socket