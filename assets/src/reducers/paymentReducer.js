import { PAYMENT } from 'actions/paymentActions'

export default function reducer(
  state={
    billing: { records: [], totalRecords: 0 },
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
        billing: {
          ...state.billing,
          records: action.payload.records,
          totalRecords: action.payload.totalRecords
        }
      }

    case PAYMENT.GET_SUBSCRIPTION:
      return { 
        ...state, 
        temp: action.payload
      }

    case PAYMENT.GET_SUBSCRIPTION_PLAN:
      return { 
        ...state, 
        temp: action.payload
      }

    case PAYMENT.CREATE_SUBSCRIPTION:
      return { 
        ...state, 
        temp: action.payload
      }

    case PAYMENT.CREATE_TRANSACTION:
      return { 
        ...state, 
        temp: action.payload
      }

    case PAYMENT.UPDATE_CREDITCARD:
      return { 
        ...state, 
        temp: action.payload
      }

    case PAYMENT.UPDATE_SUBSCRIPTION:
      return { 
        ...state, 
        temp: action.payload
      }

    case PAYMENT.DELETE_SUBSCRIPTION:
      return { 
        ...state, 
        temp: action.payload
      }
      
  }
}