import axios from 'axios'
import { handleError, handleRequestQuery, handleResponseQuery } from 'components/helper'

export const PLAN = {
  GET: 'GET_PLAN',
  SAVE: 'SAVE_PLAN',
  UPDATE: 'UPDATE_PLAN',
  DELETE: 'DELETE_PLAN'
}

export function getPlan(parameters) {
  return dispatch  => {
    return axios.get(`${process.env.REACT_APP_LOCAL_API_URL}/plan?${handleRequestQuery(parameters)}`)
    .then(response => dispatch({type: PLAN.GET, payload: handleResponseQuery(response) }) )
    .catch(err => handleError(err) )
  }
}

export function savePlan(data) {
  return dispatch => {
    return axios.post(`${process.env.REACT_APP_LOCAL_API_URL}/plan`, data)
    .then(response => dispatch({type: PLAN.SAVE, payload: response.data}) )
    .catch(err => handleError(err) )
  }
}

export function updatePlan(data) {
  return dispatch => {
    return axios.patch(`${process.env.REACT_APP_LOCAL_API_URL}/plan/${data.id}`, data)
    .then(response => dispatch({type: PLAN.UPDATE, payload: response.data}) )
    .catch(err => handleError(err) )
  }
}

export function deletePlan(data) {
  return dispatch => {
    return axios.delete(`${process.env.REACT_APP_LOCAL_API_URL}/plan/${data.id}`)
    .then(response => dispatch({type: PLAN.DELETE, payload: response.data}) )
    .catch(err => handleError(err) )
  }
}

export const PLAN_FEATURE = {
  GET: 'GET_PLAN_FEATURE',
  SAVE: 'SAVE_PLAN_FEATURE',
  UPDATE: 'UPDATE_PLAN_FEATURE',
  DELETE: 'DELETE_PLAN_FEATURE'
}

export function getPlanFeature(parameters) {
  return dispatch  => {
    return axios.get(`${process.env.REACT_APP_LOCAL_API_URL}/planFeature?${handleRequestQuery(parameters)}`)
    .then(response => dispatch({type: PLAN_FEATURE.GET, payload: handleResponseQuery(response) }) )
    .catch(err => handleError(err) )
  }
}

export function savePlanFeature(data) {
  return dispatch => {
    return axios.post(`${process.env.REACT_APP_LOCAL_API_URL}/planFeature`, data)
    .then(response => dispatch({type: PLAN_FEATURE.SAVE, payload: response.data}) )
    .catch(err => handleError(err) )
  }
}

export function updatePlanFeature(data) {
  return dispatch => {
    return axios.patch(`${process.env.REACT_APP_LOCAL_API_URL}/planFeature/${data.id}`, data)
    .then(response => dispatch({type: PLAN_FEATURE.UPDATE, payload: response.data}) )
    .catch(err => handleError(err) )
  }
}

export function deletePlanFeature(data) {
  return dispatch => {
    return axios.delete(`${process.env.REACT_APP_LOCAL_API_URL}/planFeature/${data.feature}`)
    .then(response => dispatch({type: PLAN_FEATURE.DELETE, payload: response.data}) )
    .catch(err => handleError(err) )
  }
}
