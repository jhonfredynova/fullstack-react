import { SUBSCRIPTION } from 'actions/subscriptionActions'
import { ACTION, handleResponseAction } from 'components/helper'

export default function reducer(
  state={
    temp: null
  }, 
  action={}) 
{
  switch (action.type) {

    default:
      return state

    case SUBSCRIPTION.GET_BILLING:
      return { 
        ...state, 
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload) 
      }

    case SUBSCRIPTION.GET_SUBSCRIPTION:
      return { 
        ...state, 
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload) 
      }

    case SUBSCRIPTION.GET_SUBSCRIPTION_PLAN:
      return { 
        ...state, 
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload) 
      }

    case SUBSCRIPTION.CREATE_SUBSCRIPTION:
      return { 
        ...state, 
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload) 
      }

    case SUBSCRIPTION.UPDATE_CREDITCARD:
      return { 
        ...state, 
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload) 
      }

    case SUBSCRIPTION.UPDATE_SUBSCRIPTION:
      return { 
        ...state, 
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload) 
      }

    case SUBSCRIPTION.DELETE_SUBSCRIPTION:
      return { 
        ...state, 
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload) 
      }
      
  }
}