import axios from 'axios'
import shortid from 'shortid'
import localStorage from 'localStorage'
import { isEqual, isObject, forEach, mapValues, pick } from 'lodash'
import { handleError, handleRequestQuery } from 'components/helper'

export const APP = {
  HIDE_LOADING: 'HIDE_LOADING',
  SHOW_LOADING: 'SHOW_LOADING',
  GET_CONFIG: 'GET_CONFIG',
  GET_PREFERENCE: 'GET_PREFERENCE',
  SET_MESSAGE: 'SET_MESSAGE',
  SET_PREFERENCE: 'SET_PREFERENCE',
  DELETE_MESSAGE: 'DELETE_MESSAGE'
}

export const PREFERENCE = {
  ADMIN_PAGINATION: 'adminPagination',
  CURRENCY: 'currency',
  LANGUAGE: 'language'
}

export function hideLoading() {
  return (dispatch, state) => {
    if (state().app.isLoading) {
      dispatch({ type: APP.HIDE_LOADING, payload: false })
    }
  }
}

export function showLoading() {
  return (dispatch, state) => {
    if (!state().app.isLoading) {
      dispatch({ type: APP.SHOW_LOADING, payload: true })
    }
  }
}

export function getConfig(parameters) {
  return async (dispatch, state)  => {
    return axios.get(`${process.env.REACT_APP_LOCAL_API_URL}/app/config?${handleRequestQuery(parameters)}`)
    .then(response => { 
      try{
        response = response.data
        for(let locale in response.appIntl.locales){
          response.appIntl.locales[locale] = mapValues(response.appIntl.locales[locale], (item) =>  item.replace(/{{/gi, "{").replace(/}}/gi, "}"))
        }
        dispatch({type: APP.GET_CONFIG, payload: response }) 
      }catch(e){
        handleError(e)
      }
    })
    .catch(err => handleError(err) )
  }
}

export function getPreference(key) {
  return (dispatch) => {
    let localPreferences = {}
    forEach(PREFERENCE, (value, key) => localPreferences[value] = localStorage.getItem(value))
    localPreferences = Object.compactDeep(localPreferences)
    if(key) localPreferences = pick(localPreferences, key)
    return dispatch({ type: APP.GET_PREFERENCE, payload: localPreferences })
  }
}

export function setMessage(data) {
  return (dispatch, state) => {
    if (!isEqual(pick(state().app.messages[0], Object.keys(data)), data)){
      data.id = shortid.generate()
      dispatch({ type: APP.SET_MESSAGE, payload: [data] })
    }
  }
}

export function setPreference(data) {
  return async (dispatch, state) => {
    try{
      const { appPreferences } = state().app.config
      // updating app preferences
      let newPreference = null
      let changedPreferences = false
      for(let newPreferenceKey in data){
        for(let preferenceKey in appPreferences){
          if(!localStorage.getItem(preferenceKey)) localStorage.setItem(preferenceKey, appPreferences[preferenceKey])
          if(preferenceKey===newPreferenceKey && !isEqual(appPreferences[preferenceKey], data[newPreferenceKey])){
            changedPreferences = true
            newPreference = data[newPreferenceKey]
            if(!newPreference) continue
            else appPreferences[preferenceKey] = newPreference
            if(isObject(newPreference)) newPreference = JSON.stringify(newPreference)
            localStorage.setItem(preferenceKey, newPreference)
          }
        }
      }
      // updating session preferences
      const { session } = state().auth
      if(changedPreferences && session) {
        let user = pick(session, ['id','preferences'])
        user.preferences = appPreferences
        await axios.put(`${process.env.REACT_APP_LOCAL_API_URL}/user/${user.id}`, user)
      }
      if(changedPreferences) dispatch({ type: APP.SET_PREFERENCE, payload: data })    
    }catch(e){
      handleError(e)
    }
  }
}

export function deleteMessage(id) {
  return (dispatch, state) => {
    dispatch({ type: APP.DELETE_MESSAGE, payload: [] })
  }
}
