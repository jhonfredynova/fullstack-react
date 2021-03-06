import axios from 'axios'
import socket from 'components/socket'
import { omit } from 'lodash'
import { handleRequestError, handleRequestQuery, handleResponseQuery } from 'components/helper'

export const USER = {
  GET: 'GET_USER',
  SAVE: 'SAVE_USER',
  UPDATE: 'UPDATE_USER',
  DELETE: 'DELETE_USER',
  FORGOT: 'FORGOT_USER',
  RESET: 'RESET_USER',
  VALIDATE: 'VALIDATE_USER'
}

export function getUser(parameters) {
  return dispatch  => {
    return axios.get(`${process.env.REACT_APP_LOCAL_API_URL}/user?${handleRequestQuery(parameters)}`)
    .then(response => { dispatch({type: USER.GET, payload: handleResponseQuery(response) }) })
    .catch(err => handleRequestError(err) )
  }
}

export function saveUser(data) {
  return dispatch => {
    return socket.post(`${process.env.REACT_APP_LOCAL_API_URL}/user`, data)
    .then(response => { dispatch({type: USER.SAVE, payload: response.data}) })
    .catch(err => handleRequestError(err) )
  }
}

export function updateUser(data) {
  return dispatch => {
    return socket.patch(`${process.env.REACT_APP_LOCAL_API_URL}/user/${data.id}`, data)
    .then(response => { dispatch({type: USER.UPDATE, payload: response.data}) })
    .catch(err => handleRequestError(err) )
  }
}

export function deleteUser(data) {
  return dispatch => {
    return socket.delete(`${process.env.REACT_APP_LOCAL_API_URL}/user/${data.id}`)
    .then(response => { dispatch({type: USER.DELETE, payload: response.data}) })
    .catch(err => handleRequestError(err) )
  }
}

export function forgotUser(data) {
  return dispatch => {
    return socket.post(`${process.env.REACT_APP_LOCAL_API_URL}/user/forgot`, data)
    .then(response => dispatch({type: USER.FORGOT, payload: response.data}))
    .catch(err => handleRequestError(err) )
  }
}

export function resetUser(data) {
  return dispatch => {
    return socket.post(`${process.env.REACT_APP_LOCAL_API_URL}/user/reset/${data.token}`, data)
    .then(response => dispatch({type: USER.RESET, payload: response.data}))
    .catch(err => handleRequestError(err) )
  }
}

export function validateUser(data) {
  return (dispatch, state) => {
    return socket.post(`${process.env.REACT_APP_LOCAL_API_URL}/user/validate/${data.token}`)
    .then(response => dispatch({type: USER.VALIDATE, payload: response.data}))
    .catch(err => handleRequestError(err) )
  }
} 

export const USER_ROL = {
  GET: 'GET_USER_ROL',
  SAVE: 'SAVE_USER_ROL',
  UPDATE: 'UPDATE_USER_ROL',
  DELETE: 'DELETE_USER_ROL'
}

export function getUserRol(parameters) {
  return dispatch  => {
    return axios.get(`${process.env.REACT_APP_LOCAL_API_URL}/user/${parameters.where.user}/roles?${handleRequestQuery(omit(parameters,['where.user']))}`)
    .then(response => { dispatch({type: USER_ROL.GET, payload: handleResponseQuery(response) }) })
    .catch(err => handleRequestError(err) )
  }
}

export function saveUserRol(data) {
  return dispatch => {
    return socket.put(`${process.env.REACT_APP_LOCAL_API_URL}/user/${data.user}/roles/${data.rol}`, data)
    .then(response => { dispatch({type: USER_ROL.SAVE, payload: response.data}) })
    .catch(err => handleRequestError(err) )
  }
}

export function updateUserRol(data) {
  return dispatch => {
    return socket.put(`${process.env.REACT_APP_LOCAL_API_URL}/user/${data.user}/roles/${data.rol}`, data)
    .then(response => { dispatch({type: USER_ROL.UPDATE, payload: response.data}) })
    .catch(err => handleRequestError(err) )
  }
}

export function deleteUserRol(data) {
  return dispatch => {
    return socket.delete(`${process.env.REACT_APP_LOCAL_API_URL}/user/${data.user}/roles/${data.rol}`)
    .then(response => { dispatch({type: USER_ROL.DELETE, payload: response.data}) })
    .catch(err => handleRequestError(err) )
  }
}

