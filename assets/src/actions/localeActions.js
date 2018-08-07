import axios from 'axios'
import { handleError, handleRequestQuery, handleResponseQuery } from 'components/helper'

export const LOCALE = {
  GET: 'GET_LOCALE',
  SAVE: 'SAVE_LOCALE',
  UPDATE: 'UPDATE_LOCALE',
  DELETE: 'DELETE_LOCALE'
}

export function getLocale(parameters) {
  return dispatch  => {
    return axios.get(`${process.env.REACT_APP_LOCAL_API_URL}/locale?${handleRequestQuery(parameters)}`)
    .then(response => dispatch({type: LOCALE.GET, payload: handleResponseQuery(response)}) )
    .catch(err => handleError(err) )
  }
}

export function saveLocale(data) {
  return dispatch => {
    return axios.post(`${process.env.REACT_APP_LOCAL_API_URL}/locale`, data)
    .then(response => dispatch({type: LOCALE.SAVE, payload: response.data}) )
    .catch(err => handleError(err) )
  }
}

export function updateLocale(data) {
  return dispatch => {
    return axios.patch(`${process.env.REACT_APP_LOCAL_API_URL}/locale/${data.id}`, data)
    .then(response => dispatch({type: LOCALE.UPDATE, payload: response.data}) )
    .catch(err => handleError(err) )
  }
}

export function deleteLocale(data) {
  return dispatch => {
    return axios.delete(`${process.env.REACT_APP_LOCAL_API_URL}/locale/${data.id}`)
    .then(response => dispatch({type: LOCALE.DELETE, payload: response.data}) )
    .catch(err => handleError(err) )
  }
}