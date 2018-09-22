import socket from 'components/socket'
import { handleRequestError, handleRequestQuery, handleResponseQuery } from 'components/helper'

export const ROL = {
  GET: 'GET_ROL',
  SAVE: 'SAVE_ROL',
  UPDATE: 'UPDATE_ROL',
  DELETE: 'DELETE_ROL'
} 

export function getRol(parameters) {
  return dispatch  => {
    return socket.get(`${process.env.REACT_APP_LOCAL_API_URL}/rol?${handleRequestQuery(parameters)}`)
    .then(response => { dispatch({type: ROL.GET, payload: handleResponseQuery(response) }) })
    .catch(err => handleRequestError(err) )
  }
}

export function saveRol(data) {
  return dispatch => {
    return socket.post(`${process.env.REACT_APP_LOCAL_API_URL}/rol`, data)
    .then(response => { dispatch({type: ROL.SAVE, payload: response.data}) })
    .catch(err => handleRequestError(err) )
  }
}

export function updateRol(data) {
  return dispatch => {
    return socket.patch(`${process.env.REACT_APP_LOCAL_API_URL}/rol/${data.id}`, data)
    .then(response => { dispatch({type: ROL.UPDATE, payload: response.data}) })
    .catch(err => handleRequestError(err) )
  }
}

export function deleteRol(data) {
  return dispatch => {
    return socket.delete(`${process.env.REACT_APP_LOCAL_API_URL}/rol/${data.id}`)
    .then(response => { dispatch({type: ROL.DELETE, payload: response.data}) })
    .catch(err => handleRequestError(err) )
  }
}