import socket from 'components/socket'
import { handleRequestError, handleRequestQuery, handleResponseQuery } from 'components/helper'

export const CHAT = {
  GET: 'GET_CHAT',
  SAVE: 'SAVE_CHAT',
  UPDATE: 'UPDATE_CHAT',
  DELETE: 'DELETE_CHAT'
}

export function getChat(parameters) {
  return dispatch  => {
    return socket.get(`${process.env.REACT_APP_LOCAL_API_URL}/chat?${handleRequestQuery(parameters)}`)
    .then(response => dispatch({type: CHAT.GET, payload: handleResponseQuery(response)}) )
    .catch(err => handleRequestError(err) )
  }
}

export function saveChat(data) {
  return dispatch => {
    return socket.post(`${process.env.REACT_APP_LOCAL_API_URL}/chat`, data)
    .then(response => dispatch({type: CHAT.SAVE, payload: response.data}) )
    .catch(err => handleRequestError(err) )
  }
}

export function updateChat(data) {
  return dispatch => {
    return socket.patch(`${process.env.REACT_APP_LOCAL_API_URL}/chat/${data.id}`, data)
    .then(response => dispatch({type: CHAT.UPDATE, payload: response.data}) )
    .catch(err => handleRequestError(err) )
  }
}

export function deleteChat(data) {
  return dispatch => {
    return socket.delete(`${process.env.REACT_APP_LOCAL_API_URL}/chat/${data.id}`)
    .then(response => dispatch({type: CHAT.DELETE, payload: response.data}) )
    .catch(err => handleRequestError(err) )
  }
}

export const CHAT_MESSAGE = {
  GET: 'GET_CHAT_MESSAGE',
  SAVE: 'SAVE_CHAT_MESSAGE',
  UPDATE: 'UPDATE_CHAT_MESSAGE',
  DELETE: 'DELETE_CHAT_MESSAGE'
}

export function getChatMessage(parameters) {
  return dispatch  => {
    return socket.get(`${process.env.REACT_APP_LOCAL_API_URL}/chatMessage?${handleRequestQuery(parameters)}`)
    .then(response => dispatch({type: CHAT_MESSAGE.GET, payload: handleResponseQuery(response) }) )
    .catch(err => handleRequestError(err) )
  }
}

export function saveChatMessage(data) {
  return dispatch => {
    return socket.post(`${process.env.REACT_APP_LOCAL_API_URL}/chatMessage`, data)
    .then(response => dispatch({type: CHAT_MESSAGE.SAVE, payload: response.data}) )
    .catch(err => handleRequestError(err) )
  }
}

export function updateChatMessage(data) {
  return dispatch => {
    return socket.patch(`${process.env.REACT_APP_LOCAL_API_URL}/chatMessage/${data.id}`, data)
    .then(response => dispatch({type: CHAT_MESSAGE.UPDATE, payload: response.data}) )
    .catch(err => handleRequestError(err) )
  }
}

export function deleteChatMessage(data) {
  return dispatch => {
    return socket.delete(`${process.env.REACT_APP_LOCAL_API_URL}/chatMessage/${data.id}`)
    .then(response => dispatch({type: CHAT_MESSAGE.DELETE, payload: response.data}) )
    .catch(err => handleRequestError(err) )
  }
}