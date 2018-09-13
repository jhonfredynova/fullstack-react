import { AUTH } from 'actions/authActions'
import { isEmpty } from 'lodash'

export default function reducer(
  state={
    isAuthenticated: null,
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
        isAuthenticated: !isEmpty(action.payload),
        session: action.payload
      }

    case AUTH.LOGIN:
      return { 
        ...state,
        isAuthenticated: isEmpty(action.payload),
        session: action.payload
      }

    case AUTH.LOGOUT:
      return { 
        ...state, 
        isAuthenticated: false,
        session: action.payload,
        token: null
      }

    case AUTH.REGISTER:
      return { 
        ...state, 
        temp: action.payload
      }

    case AUTH.GET_TOKEN:
      return { 
        ...state, 
        token: action.payload
      }

    case AUTH.SET_TOKEN:
      return { 
        ...state, 
        token: action.payload
      }
      
  }
}