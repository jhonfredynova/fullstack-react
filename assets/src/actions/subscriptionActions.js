import axios from 'axios'
import { handleError, handleRequestQuery } from 'components/helper'

export const SUBSCRIPTION = {
  GET_BILLING: 'GET_BILLING',
  GET_SUBSCRIPTION: 'GET_SUBSCRIPTION',
  GET_SUBSCRIPTION_PLAN: 'GET_SUBSCRIPTION_PLAN',
  CREATE_SUBSCRIPTION: 'CREATE_SUBSCRIPTION',
  UPDATE_CREDITCARD: 'UPDATE_CREDITCARD',
  UPDATE_SUBSCRIPTION: 'UPDATE_SUBSCRIPTION',
  DELETE_SUBSCRIPTION: 'DELETE_SUBSCRIPTION'
}

export function getBilling(parameters) {
  return dispatch => {
    return axios.get(`${process.env.REACT_APP_LOCAL_API_URL}/subscription/billing/${parameters.clientCode}`)
    .then(response => dispatch({type: SUBSCRIPTION.GET_BILLING, payload: response.data}))
    .catch(err => handleError(err) )
  }
}

export function getSubscription(parameters) {
  return dispatch => {
    return axios.get(`${process.env.REACT_APP_LOCAL_API_URL}/subscription/${parameters.subscriptionId}`)
    .then(response => dispatch({type: SUBSCRIPTION.GET_SUBSCRIPTION, payload: response.data}))
    .catch(err => handleError(err) )
  }
}

export function getSubscriptionPlan(parameters) {
  return dispatch => {
    return axios.get(`${process.env.REACT_APP_LOCAL_API_URL}/subscription/plan?${handleRequestQuery(parameters)}`)
    .then(response => dispatch({type: SUBSCRIPTION.GET_SUBSCRIPTION_PLAN, payload: response.data}))
    .catch(err => handleError(err) )
  }
}

export function createSubscription(data) {
  return dispatch => {
    return axios.post(`${process.env.REACT_APP_LOCAL_API_URL}/subscription`, data)
    .then(response => dispatch({type: SUBSCRIPTION.CREATE_SUBSCRIPTION, payload: response.data}))
    .catch(err => handleError(err) )
  }
}

export function updateCreditCard(data) {
  return dispatch => {
    return axios.put(`${process.env.REACT_APP_LOCAL_API_URL}/subscription/${data.subscriptionId}/${data.clientCode}/${data.creditCardId}`, data)
    .then(response => dispatch({type: SUBSCRIPTION.UPDATE_CREDITCARD, payload: response.data}))
    .catch(err => handleError(err) )
  }
}

export function updateSubscription(data) {
  return dispatch => {
    return axios.put(`${process.env.REACT_APP_LOCAL_API_URL}/subscription/${data.subscriptionId}`, data)
    .then(response => dispatch({type: SUBSCRIPTION.UPDATE_SUBSCRIPTION, payload: response.data}))
    .catch(err => handleError(err) )
  }
}


export function deleteSubscription(data) {
  return dispatch => {
    return axios.put(`${process.env.REACT_APP_LOCAL_API_URL}/subscription/${data.subscriptionId}`, data)
    .then(response => dispatch({type: SUBSCRIPTION.DELETE_SUBSCRIPTION, payload: response.data}))
    .catch(err => handleError(err) )
  }
}