import axios from 'axios'
import { handleError, handleRequestQuery, handleResponseQuery } from 'components/helper'

export const CATALOG = {
  GET: 'GET_CATALOG',
  SAVE: 'SAVE_CATALOG',
  UPDATE: 'UPDATE_CATALOG',
  DELETE: 'DELETE_CATALOG'
}

export function getCatalog(parameters) {
  return dispatch  => {
    return axios.get(`${process.env.REACT_APP_LOCAL_API_URL}/catalog?${handleRequestQuery(parameters)}`)
    .then(response => dispatch({type: CATALOG.GET, payload: handleResponseQuery(response)}) )
    .catch(err => handleError(err) )
  }
}

export function saveCatalog(data) {
  return dispatch => {
    return axios.post(`${process.env.REACT_APP_LOCAL_API_URL}/catalog`, data)
    .then(response => dispatch({type: CATALOG.SAVE, payload: response.data}) )
    .catch(err => handleError(err) )
  }
}

export function updateCatalog(data) {
  return dispatch => {
    return axios.put(`${process.env.REACT_APP_LOCAL_API_URL}/catalog/${data.id}`, data)
    .then(response => dispatch({type: CATALOG.UPDATE, payload: response.data}) )
    .catch(err => handleError(err) )
  }
}

export function deleteCatalog(data) {
  return dispatch => {
    return axios.delete(`${process.env.REACT_APP_LOCAL_API_URL}/catalog/${data.id}`)
    .then(response => dispatch({type: CATALOG.DELETE, payload: response.data}) )
    .catch(err => handleError(err) )
  }
}