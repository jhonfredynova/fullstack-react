import { USER, USER_ROL } from 'actions/userActions'
import { ACTION, handleResponseAction } from 'components/helper'

export default function reducer(
  state={
    users: { records: [], recordsTotal: 0 },
    roles: { records: [], recordsTotal: 0 },
    temp: null
  }, 
  action={}) 
{
  switch (action.type) {

    default:
      return state

    case USER.GET:
      return { 
        ...state, 
        users: handleResponseAction(ACTION.GET, state.users, action.payload.find || state.users),
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload.findOne)
      }

    case USER.SAVE:
      return { 
        ...state, 
        users: handleResponseAction(ACTION.SAVE, state.users, action.payload) 
      }

    case USER.UPDATE:
      return { 
        ...state, 
        users: handleResponseAction(ACTION.UPDATE, state.users, action.payload) 
      }

    case USER.DELETE:
      return { 
        ...state, 
        users: handleResponseAction(ACTION.DELETE, state.users, action.payload) 
      }

    case USER.FORGOT:
      return { 
        ...state, 
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload) 
      }

    case USER.RESET:
      return { 
        ...state, 
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload) 
      }

    case USER.VALIDATE:
      return { 
        ...state, 
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload) 
      }

    case USER_ROL.GET:
      return { 
        ...state, 
        roles: handleResponseAction(ACTION.GET, state.roles, action.payload.find || state.roles),
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload.findOne)
      }
      
    case USER_ROL.SAVE:
      return { 
        ...state, 
        roles: handleResponseAction(ACTION.SAVE, state.roles, action.payload) 
      }

    case USER_ROL.UPDATE:
      return { 
        ...state, 
        roles: handleResponseAction(ACTION.UPDATE, state.roles, action.payload) 
      }

    case USER_ROL.DELETE:
      return { 
        ...state, 
        roles: handleResponseAction(ACTION.DELETE, state.roles, action.payload) 
      }
    
  }
}