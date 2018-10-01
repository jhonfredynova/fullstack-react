import sailsIOClient from 'sails.io.js'
import socketIOClient from 'socket.io-client'

function Socket(params){
  this.io = sailsIOClient(socketIOClient)
  Object.keys(params).map(key => (this.io.sails[key] = params[key]))

  this.setHeader = (headers) => {
    this.io.socket.headers = headers
  }

  this.parseResponse = (resolve, reject, response) => {
    if(response.statusCode<200 || response.statusCode>=400) return reject(response)
    response.data = response.body
    resolve(response)
  }

  this.parseUrl = (url) => {
    return url.replace(process.env.REACT_APP_LOCAL_API_SERVER, '')
  }

  this.get = (url, data) => {
    return new Promise((resolve, reject) => {
      this.io.socket.get(this.parseUrl(url), data, (body, jwr) => this.parseResponse(resolve, reject, jwr))
    })
  }

  this.post = (url, data) => {
    return new Promise((resolve, reject) => {
      this.io.socket.post(this.parseUrl(url), data, (body, jwr) => this.parseResponse(resolve, reject, jwr))
    })
  }

  this.patch = (url, data) => {
    return new Promise((resolve, reject) => {
      this.io.socket.patch(this.parseUrl(url), data, (body, jwr) => this.parseResponse(resolve, reject, jwr))
    })
  }

  this.delete = (url, data) => {
    return new Promise((resolve, reject) => {
      this.io.socket.delete(this.parseUrl(url), data, (body, jwr) => this.parseResponse(resolve, reject, jwr))
    })
  }

  this.on = (event, callback) => {
    return new Promise(resolve => {
      this.io.socket.on(event, (data) => {
        callback(data)
        resolve(data)
      })
    })
  }

  this.off = (event, callback) => {
    return new Promise(resolve => {
      this.io.socket.off(event, (data) => {
        callback(data)
        resolve(data)
      })
    })
  }
}
const authorization = JSON.parse(localStorage.token)
const socket = new Socket({ 
  autoConnect: true,
  headers: { 'authorization': `${authorization.provider} ${authorization.token}` },
  url: process.env.REACT_APP_LOCAL_API_SERVER,
  useCORSRouteToGetCookie: false
})

export default socket