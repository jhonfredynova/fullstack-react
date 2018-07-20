import { CATALOG } from 'actions/catalogActions'
import { ACTION, handleResponseAction } from 'components/helper'

export default function reducer(
  state={
    catalogs: { records: [], recordsTotal: 0 },
    temp: null
  }, 
  action={}) 
{
  switch (action.type) {

    default:
      return state

    case CATALOG.GET:
      return { 
        ...state, 
        catalogs: handleResponseAction(ACTION.GET, state.catalogs, action.payload.find || state.catalogs),
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload.findOne)
      }

    case CATALOG.SAVE:
      return { 
        ...state, 
        catalogs: handleResponseAction(ACTION.SAVE, state.catalogs, action.payload) 
      }

    case CATALOG.UPDATE:
      return { 
        ...state, 
        catalogs: handleResponseAction(ACTION.UPDATE, state.catalogs, action.payload) 
      }

    case CATALOG.DELETE:
      return { 
        ...state, 
        catalogs: handleResponseAction(ACTION.DELETE, state.catalogs, action.payload) 
      }
      
  }
}