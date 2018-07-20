import { ROL } from 'actions/rolActions'
import { ACTION, handleResponseAction } from 'components/helper'

export default function reducer(
  state={
    roles: { records: [], recordsTotal: 0 },
    temp: null
  }, 
  action={}) 
{
  switch (action.type) {

    default:
      return state

    case ROL.GET:
      return { 
        ...state, 
        roles: handleResponseAction(ACTION.GET, state.roles, action.payload.find || state.roles),
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload.findOne)
      }

    case ROL.SAVE:
      return { 
        ...state, 
        roles: handleResponseAction(ACTION.SAVE, state.roles, action.payload) 
      }

    case ROL.UPDATE:
      return { 
        ...state, 
        roles: handleResponseAction(ACTION.UPDATE, state.roles, action.payload) 
      }

    case ROL.DELETE:
      return { 
        ...state, 
        roles: handleResponseAction(ACTION.DELETE, state.roles, action.payload) 
      }
    
  }
}