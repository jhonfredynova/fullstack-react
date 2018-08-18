import axios from 'axios'
import localStorage from 'localStorage'

const setHeader = store => next => action => {
  const appPreferences = store.getState().app.config.appPreferences || localStorage
  const authorization = store.getState().auth.token
  if(authorization) axios.defaults.headers.common['Authorization'] = `${authorization.provider} ${authorization.token}`
  axios.defaults.headers.common['Accept-Currency'] = appPreferences.currency
  axios.defaults.headers.common['Accept-Language'] = appPreferences.language
  next(action)
}

export default setHeader