import axios from 'axios'
import localStorage from 'localStorage'
import { handleError } from 'components/helper'

export const AUTH = {
  GET: 'GET_SESSION',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REGISTER: 'LOGOUT',
  GET_TOKEN: 'GET_TOKEN',
  SET_TOKEN: 'SET_TOKEN',
  TOKEN_NAME: 'token'
}

export function me() {
  return (dispatch, state) => {
    if (!state().auth.token) return
    return axios.get(`${process.env.REACT_APP_LOCAL_API_URL}/auth/me`)
    .then(response => dispatch({type: AUTH.GET, payload: response.data}))
    .catch(err => dispatch({type: AUTH.GET, payload: null}) )
  }
}

export function login(data) {
  return dispatch => {
    return axios.post(`${process.env.REACT_APP_LOCAL_API_URL}/auth/login`, data)
    .then(response => dispatch({type: AUTH.LOGIN, payload: response.data}))
    .catch(err => handleError(err) )
  }
}

export function logout(username) {
  return (dispatch, state) => {
    localStorage.removeItem(AUTH.TOKEN_NAME)
    dispatch({type: AUTH.LOGOUT, payload: null})
  }
}

export function register(data) {
  return dispatch => {
    return axios.post(`${process.env.REACT_APP_LOCAL_API_URL}/auth/register`, data)
    .then(response => dispatch({type: AUTH.REGISTER, payload: response.data}))
    .catch(err => handleError(err) )
  }
}

export function getToken() {
  return (dispatch, state) => {
    let token = localStorage.getItem(AUTH.TOKEN_NAME) ? JSON.parse(localStorage.getItem(AUTH.TOKEN_NAME)) : null
    state().auth.token = token
    dispatch({ type: AUTH.GET_TOKEN, payload: token })
  }
}

export function setToken(data) {
  return (dispatch, state) => {
    localStorage.setItem(AUTH.TOKEN_NAME, JSON.stringify(data))
    state().auth.token = data
    dispatch({ type: AUTH.SET_TOKEN, payload: data })
  }
}