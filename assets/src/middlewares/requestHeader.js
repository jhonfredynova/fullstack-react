import axios from 'axios'
import { AUTH } from 'actions/authActions'
import socket from 'components/socket'

const requestHeader = store => next => action => {
  const appPreferences = store.getState().app.config.appPreferences || localStorage
  const authorization = JSON.parse(localStorage.getItem(AUTH.TOKEN_NAME))
  if(authorization){
    axios.defaults.headers.common['authorization'] = `${authorization.provider} ${authorization.token}`
    socket.setHeader({ 'authorization': `${authorization.provider} ${authorization.token}` })
  }
  if(appPreferences.currency) axios.defaults.headers.common['Accept-Currency'] = appPreferences.currency
  if(appPreferences.language) axios.defaults.headers.common['Accept-Language'] = appPreferences.language
  next(action)
}

export default requestHeader