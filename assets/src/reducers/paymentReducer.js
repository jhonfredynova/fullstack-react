import { PAYMENT } from 'actions/paymentActions'
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

    case PAYMENT.GET_BILLING:
      return { 
        ...state, 
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload) 
      }

    case PAYMENT.GET_SUBSCRIPTION:
      return { 
        ...state, 
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload) 
      }

    case PAYMENT.GET_SUBSCRIPTION_PLAN:
      return { 
        ...state, 
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload) 
      }

    case PAYMENT.CREATE_SUBSCRIPTION:
      return { 
        ...state, 
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload) 
      }

    case PAYMENT.UPDATE_CREDITCARD:
      return { 
        ...state, 
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload) 
      }

    case PAYMENT.UPDATE_SUBSCRIPTION:
      return { 
        ...state, 
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload) 
      }

    case PAYMENT.DELETE_SUBSCRIPTION:
      return { 
        ...state, 
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload) 
      }
      
  }
}