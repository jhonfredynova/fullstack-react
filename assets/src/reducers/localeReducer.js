import { LOCALE } from 'actions/localeActions'
import { ACTION, handleResponseAction } from 'components/helper'

export default function reducer(
  state={
    locales: { records: [], recordsTotal: 0 },
    temp: null
  }, 
  action={}) 
{
  switch (action.type) {

    default:
      return state

    case LOCALE.GET:
      return { 
        ...state, 
        locales: handleResponseAction(ACTION.GET, state.locales, action.payload.find || state.locales),
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload.findOne)
      }

    case LOCALE.SAVE:
      return { 
        ...state, 
        locales: handleResponseAction(ACTION.SAVE, state.locales, action.payload) 
      }

    case LOCALE.UPDATE:
      return { 
        ...state, 
        locales: handleResponseAction(ACTION.UPDATE, state.locales, action.payload) 
      }

    case LOCALE.DELETE:
      return { 
        ...state, 
        locales: handleResponseAction(ACTION.DELETE, state.locales, action.payload) 
      }
      
  }
}