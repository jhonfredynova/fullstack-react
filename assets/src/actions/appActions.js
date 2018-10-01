import shortid from 'shortid'
import socket from 'components/socket'
import { isEqual, mapValues, pick } from 'lodash'
import { handleRequestError, handleRequestQuery } from 'components/helper'

export const APP = {
  HIDE_LOADING: 'HIDE_LOADING',
  SHOW_LOADING: 'SHOW_LOADING',
  GET_CONFIG: 'GET_CONFIG',
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
  return (dispatch, state)  => {
    return socket.get(`${process.env.REACT_APP_LOCAL_API_URL}/app/config?${handleRequestQuery(parameters)}`)
    .then(response => { 
      response = response.data
      // updating locales
      for(let locale in response.appIntl.locales){
        response.appIntl.locales[locale] = mapValues(response.appIntl.locales[locale], (item) =>  item.replace(/{{/gi, "{").replace(/}}/gi, "}"))
      }
      // updating preferences
      for(let key in response.appPreferences){
        response.appPreferences[key] = localStorage.getItem(key) || response.appPreferences[key]
      }
      state().i18nState.translations = response.appIntl.locales
      state().i18nState.lang = response.appPreferences.language
      dispatch({type: APP.GET_CONFIG, payload: response }) 
    })
    .catch(err => handleRequestError(err) )
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
      // updating app preferences
      const { appPreferences } =  state().app.config
      let changedPreferences = false
      for(let key in data){      
        if(!appPreferences[key]) continue
        if(appPreferences[key]!==data[key]){
          appPreferences[key] = data[key]
          localStorage.setItem(key, appPreferences[key]) 
          changedPreferences = true
        }
      }
      // updating session preferences
      const { session } = state().auth
      if(changedPreferences && session) {
        let user = pick(session, ['id','preferences'])
        user.preferences = appPreferences
        await socket.patch(`${process.env.REACT_APP_LOCAL_API_URL}/user/${user.id}`, user)
      }
      if(changedPreferences) dispatch({ type: APP.SET_PREFERENCE, payload: changedPreferences })    
    }catch(e){
      handleRequestError(e)
    }
  }
}

export function deleteMessage() {
  return (dispatch, state) => {
    if(state().app.messages.length>0){
      dispatch({ type: APP.DELETE_MESSAGE, payload: [] })
    }
  }
}
