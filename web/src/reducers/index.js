import { combineReducers } from 'redux'
import app from 'reducers/appReducer'
import auth from 'reducers/authReducer'
import catalog from 'reducers/catalogReducer'
import { i18nState } from 'redux-i18n'
import locale from 'reducers/localeReducer'
import user from 'reducers/userReducer'
import plan from 'reducers/planReducer'
import rol from 'reducers/rolReducer'
import subscription from 'reducers/subscriptionReducer'

export default combineReducers({
  app,
  auth,
  catalog,
  i18nState,
  locale,
  user,
  plan,
  rol,
  subscription
})