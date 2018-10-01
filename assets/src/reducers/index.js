import { combineReducers } from 'redux'
import app from 'reducers/appReducer'
import auth from 'reducers/authReducer'
import catalog from 'reducers/catalogReducer'
import chat from 'reducers/chatReducer'
import { i18nState } from 'redux-i18n'
import locale from 'reducers/localeReducer'
import payment from 'reducers/paymentReducer'
import plan from 'reducers/planReducer'
import rol from 'reducers/rolReducer'
import socket from 'reducers/socketReducer'
import user from 'reducers/userReducer'

export default combineReducers({
  app,
  auth,
  catalog,
  chat,
  i18nState,
  locale,
  payment,
  plan,
  rol,
  socket,
  user
})