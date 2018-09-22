import socket from 'components/socket'
import { handleRequestError, handleRequestQuery, handleResponseQuery } from 'components/helper'

export const CATALOG = {
  GET: 'GET_CATALOG',
  SAVE: 'SAVE_CATALOG',
  UPDATE: 'UPDATE_CATALOG',
  DELETE: 'DELETE_CATALOG'
}

export function getCatalog(parameters) {
  return dispatch  => {
    return socket.get(`${process.env.REACT_APP_LOCAL_API_URL}/catalog?${handleRequestQuery(parameters)}`)
    .then(response => dispatch({type: CATALOG.GET, payload: handleResponseQuery(response)}) )
    .catch(err => handleRequestError(err) )
  }
}

export function saveCatalog(data) {
  return dispatch => {
    return socket.post(`${process.env.REACT_APP_LOCAL_API_URL}/catalog`, data)
    .then(response => dispatch({type: CATALOG.SAVE, payload: response.data}) )
    .catch(err => handleRequestError(err) )
  }
}

export function updateCatalog(data) {
  return dispatch => {
    return socket.patch(`${process.env.REACT_APP_LOCAL_API_URL}/catalog/${data.id}`, data)
    .then(response => dispatch({type: CATALOG.UPDATE, payload: response.data}) )
    .catch(err => handleRequestError(err) )
  }
}

export function deleteCatalog(data) {
  return dispatch => {
    return socket.delete(`${process.env.REACT_APP_LOCAL_API_URL}/catalog/${data.id}`)
    .then(response => dispatch({type: CATALOG.DELETE, payload: response.data}) )
    .catch(err => handleRequestError(err) )
  }
}