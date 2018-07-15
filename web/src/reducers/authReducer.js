import { AUTH } from 'actions/authActions'
import { ACTION, handleResponseAction } from 'components/helper'

export default function reducer(
  state={
    isAuthenticated: false,
    session: null,
    temp: null,
    token: null
  }, 
  action={}) 
{
  switch (action.type) {

    default:
      return state

    case AUTH.GET:
      return { 
        ...state, 
        isAuthenticated: !Object.isEmpty(action.payload),
        session: handleResponseAction(ACTION.TEMP, state.session, action.payload)
      }

    case AUTH.LOGIN:
      return { 
        ...state,
        session: handleResponseAction(ACTION.TEMP, state.session, action.payload) 
      }

    case AUTH.LOGOUT:
      return { 
        ...state, 
        isAuthenticated: false,
        session: handleResponseAction(ACTION.TEMP, state.session, action.payload),
        token: null
      }

    case AUTH.REGISTER:
      return { 
        ...state, 
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload) 
      }

    case AUTH.GET_TOKEN:
      return { 
        ...state, 
        token: handleResponseAction(ACTION.TEMP, state.token, action.payload) 
      }

    case AUTH.SET_TOKEN:
      return { 
        ...state, 
        token: handleResponseAction(ACTION.TEMP, state.token, action.payload) 
      }
      
  }
}