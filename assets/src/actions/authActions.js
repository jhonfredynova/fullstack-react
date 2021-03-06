import axios from 'axios'
import socket from 'components/socket'
import { handleRequestError } from 'components/helper'

export const AUTH = {
  SOCKET_CONNECT: 'SOCKET_CONNECT',
  GET: 'GET_SESSION',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REGISTER: 'LOGOUT',
  GET_TOKEN: 'GET_TOKEN',
  SET_TOKEN: 'SET_TOKEN',
  TOKEN_NAME: 'token'
}

export function socketConnect(data) {
  return dispatch => {
    return socket.post(`${process.env.REACT_APP_LOCAL_API_URL}/auth/socketConnect`, data)
    .then(response => dispatch({type: AUTH.SOCKET_CONNECT, payload: response.data}))
    .catch(err => handleRequestError(err) )
  }
}

export function me() {
  return dispatch => {
    if (!localStorage.getItem(AUTH.TOKEN_NAME)) return dispatch({type: AUTH.GET, payload: null})
    return axios.get(`${process.env.REACT_APP_LOCAL_API_URL}/auth/me`)
    .then(response => dispatch({type: AUTH.GET, payload: response.data}))
    .catch(err => dispatch({type: AUTH.GET, payload: null}) )
  }
}

export function login(data) {
  return dispatch => {
    return socket.post(`${process.env.REACT_APP_LOCAL_API_URL}/auth/login`, data)
    .then(response => dispatch({type: AUTH.LOGIN, payload: response.data}))
    .catch(err => handleRequestError(err) )
  }
}

export function logout(data) {
  return dispatch => {
    return socket.post(`${process.env.REACT_APP_LOCAL_API_URL}/auth/logout`, data)
    .then(response => {
      localStorage.removeItem(AUTH.TOKEN_NAME)
      dispatch({type: AUTH.LOGOUT, payload: null})  
    })
    .catch(err => handleRequestError(err) )
  }
}

export function register(data) {
  return dispatch => {
    return socket.post(`${process.env.REACT_APP_LOCAL_API_URL}/auth/register`, data)
    .then(response => dispatch({type: AUTH.REGISTER, payload: response.data}))
    .catch(err => handleRequestError(err) )
  }
}

export function getToken() {
  return dispatch => {
    let token = localStorage.getItem(AUTH.TOKEN_NAME) ? JSON.parse(localStorage.getItem(AUTH.TOKEN_NAME)) : null
    dispatch({ type: AUTH.GET_TOKEN, payload: token })
  }
}

export function setToken(data) {
  return dispatch => {
    localStorage.setItem(AUTH.TOKEN_NAME, JSON.stringify(data))
    dispatch({ type: AUTH.SET_TOKEN, payload: data })
  }
}