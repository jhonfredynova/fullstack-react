import { AUTH } from 'actions/authActions'

export default function reducer(
  state={
    session: undefined,
    temp: null
  }, 
  action={}) 
{
  switch (action.type) {

    default:
      return state

    case AUTH.SOCKET_CONNECT:
      return { 
        ...state, 
        temp: action.payload
      }

    case AUTH.GET:
      return { 
        ...state, 
        session: action.payload
      }

    case AUTH.LOGIN:
      return { 
        ...state,
        session: action.payload
      }

    case AUTH.LOGOUT:
      return { 
        ...state, 
        session: action.payload
      }

    case AUTH.REGISTER:
      return { 
        ...state, 
        temp: action.payload
      }

    case AUTH.GET_TOKEN:
      return { 
        ...state, 
        temp: action.payload
      }

    case AUTH.SET_TOKEN:
      return { 
        ...state, 
        temp: action.payload
      }
      
  }
}