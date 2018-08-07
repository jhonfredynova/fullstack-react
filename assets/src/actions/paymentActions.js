import axios from 'axios'
import { handleError, handleRequestQuery } from 'components/helper'

export const PAYMENT = {
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
    return axios.get(`${process.env.REACT_APP_LOCAL_API_URL}/payment/subscription/billing/${parameters.clientCode}`)
    .then(response => dispatch({type: PAYMENT.GET_BILLING, payload: response.data}))
    .catch(err => handleError(err) )
  }
}

export function getSubscription(parameters) {
  return dispatch => {
    return axios.get(`${process.env.REACT_APP_LOCAL_API_URL}/payment/subscription/${parameters.subscriptionId}`)
    .then(response => dispatch({type: PAYMENT.GET_SUBSCRIPTION, payload: response.data}))
    .catch(err => handleError(err) )
  }
}

export function getSubscriptionPlan(parameters) {
  return dispatch => {
    return axios.get(`${process.env.REACT_APP_LOCAL_API_URL}/payment/subscription/plan?${handleRequestQuery(parameters)}`)
    .then(response => dispatch({type: PAYMENT.GET_SUBSCRIPTION_PLAN, payload: response.data}))
    .catch(err => handleError(err) )
  }
}

export function createSubscription(data) {
  return dispatch => {
    return axios.post(`${process.env.REACT_APP_LOCAL_API_URL}/payment/subscription`, data)
    .then(response => dispatch({type: PAYMENT.CREATE_SUBSCRIPTION, payload: response.data}))
    .catch(err => handleError(err) )
  }
}

export function updateCreditCard(data) {
  return dispatch => {
    return axios.patch(`${process.env.REACT_APP_LOCAL_API_URL}/payment/subscription/${data.subscriptionId}/${data.clientCode}/${data.creditCardId}`, data)
    .then(response => dispatch({type: PAYMENT.UPDATE_CREDITCARD, payload: response.data}))
    .catch(err => handleError(err) )
  }
}

export function updateSubscription(data) {
  return dispatch => {
    return axios.patch(`${process.env.REACT_APP_LOCAL_API_URL}/payment/subscription/${data.subscriptionId}`, data)
    .then(response => dispatch({type: PAYMENT.UPDATE_SUBSCRIPTION, payload: response.data}))
    .catch(err => handleError(err) )
  }
}


export function deleteSubscription(data) {
  return dispatch => {
    return axios.patch(`${process.env.REACT_APP_LOCAL_API_URL}/payment/subscription/${data.subscriptionId}`, data)
    .then(response => dispatch({type: PAYMENT.DELETE_SUBSCRIPTION, payload: response.data}))
    .catch(err => handleError(err) )
  }
}