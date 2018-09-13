import axios from 'axios'
import { handleRequestError, handleRequestQuery, handleResponseQuery } from 'components/helper'

export const PAYMENT = {
  GET_BILLING: 'GET_BILLING',
  GET_SUBSCRIPTION: 'GET_SUBSCRIPTION',
  GET_SUBSCRIPTION_PLAN: 'GET_SUBSCRIPTION_PLAN',
  CREATE_SUBSCRIPTION: 'CREATE_SUBSCRIPTION',
  CREATE_TRANSACTION: 'CREATE_TRANSACTION',
  UPDATE_CREDITCARD: 'UPDATE_CREDITCARD',
  UPDATE_SUBSCRIPTION: 'UPDATE_SUBSCRIPTION',
  DELETE_SUBSCRIPTION: 'DELETE_SUBSCRIPTION'
}

export function getBilling(parameters) {
  return dispatch => {
    return axios.get(`${process.env.REACT_APP_LOCAL_API_URL}/payment/subscription/billing?${handleRequestQuery(parameters)}`)
    .then(response => dispatch({type: PAYMENT.GET_BILLING, payload: handleResponseQuery(response)}))
    .catch(err => handleRequestError(err) )
  }
}

export function getSubscription(parameters) {
  return dispatch => {
    return axios.get(`${process.env.REACT_APP_LOCAL_API_URL}/payment/subscription/${parameters.subscriptionId}`)
    .then(response => dispatch({type: PAYMENT.GET_SUBSCRIPTION, payload: response.data}))
    .catch(err => handleRequestError(err) )
  }
}

export function getSubscriptionPlan(parameters) {
  return dispatch => {
    return axios.get(`${process.env.REACT_APP_LOCAL_API_URL}/payment/subscription/plan?${handleRequestQuery(parameters)}`)
    .then(response => dispatch({type: PAYMENT.GET_SUBSCRIPTION_PLAN, payload: response.data}))
    .catch(err => handleRequestError(err) )
  }
}

export function createSubscription(data) {
  return dispatch => {
    return axios.post(`${process.env.REACT_APP_LOCAL_API_URL}/payment/subscription`, data)
    .then(response => dispatch({type: PAYMENT.CREATE_SUBSCRIPTION, payload: response.data}))
    .catch(err => handleRequestError(err) )
  }
}

export function createTransaction(data) {
  return dispatch => {
    return axios.post(`${process.env.REACT_APP_LOCAL_API_URL}/payment/transaction`, data)
    .then(response => dispatch({type: PAYMENT.CREATE_TRANSACTION, payload: response.data}))
    .catch(err => handleRequestError(err) )
  }
}

export function updateCreditCard(data) {
  return dispatch => {
    return axios.patch(`${process.env.REACT_APP_LOCAL_API_URL}/payment/subscription/creditCard/${data.clientCode}`, data)
    .then(response => dispatch({type: PAYMENT.UPDATE_CREDITCARD, payload: response.data}))
    .catch(err => handleRequestError(err) )
  }
}

export function updateSubscription(data) {
  return dispatch => {
    return axios.patch(`${process.env.REACT_APP_LOCAL_API_URL}/payment/subscription/${data.subscriptionId}`, data)
    .then(response => dispatch({type: PAYMENT.UPDATE_SUBSCRIPTION, payload: response.data}))
    .catch(err => handleRequestError(err) )
  }
}


export function deleteSubscription(data) {
  return dispatch => {
    return axios.patch(`${process.env.REACT_APP_LOCAL_API_URL}/payment/subscription/${data.subscriptionId}`, data)
    .then(response => dispatch({type: PAYMENT.DELETE_SUBSCRIPTION, payload: response.data}))
    .catch(err => handleRequestError(err) )
  }
}