import socket from 'components/socket'
import { handleRequestError } from 'components/helper'

export const EVENT = {
  CONNECT: 'connect'
}

export const SOCKET = {
  CONNECT: 'CONNECT_SOCKET',
  ON: 'ON_SOCKET',
  OFF: 'OFF_SOCKET'
}

export function connectSocket(data) {
  return (dispatch, state) => {
    return socket.post(`${process.env.REACT_APP_LOCAL_API_URL}/socket/connect`, data)
    .then(response => dispatch({type: SOCKET.CONNECT, payload: response.data}))
    .catch(err => handleRequestError(err) )
  }
}

export function onEvent(event, callback) {
  return dispatch => { 
    return socket.on(event, callback)
    .then(response => dispatch({type: SOCKET.ON, payload: event}))
    .catch(err => handleRequestError(err) )
  }
}

export function offEvent(event, callback) {
  return dispatch => {
    return socket.off(event, callback)
    .then(response => dispatch({type: SOCKET.OFF, payload: event}))
    .catch(err => handleRequestError(err) )
  }
}
