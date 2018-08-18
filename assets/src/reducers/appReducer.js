import { APP } from 'actions/appActions'
import { ACTION, handleResponseAction } from 'components/helper'

export default function reducer(
  state={
    isLoading: false,
    config: {}, 
    messages: [],
    temp: null
  }, 
  action = {})
{
  switch(action.type) {
    
    default: 
      return state
    
    case APP.HIDE_LOADING:
      return { 
        ...state, 
        isLoading: handleResponseAction(ACTION.TEMP, state.isLoading, action.payload) 
      }
      
    case APP.SHOW_LOADING:
      return { 
        ...state, 
        isLoading: handleResponseAction(ACTION.TEMP, state.isLoading, action.payload) 
      }

    case APP.GET_CONFIG:
      return { 
        ...state, 
        config: handleResponseAction(ACTION.TEMP, state.config, action.payload) 
      }

    case APP.SET_MESSAGE:
      return { 
        ...state, 
        messages: handleResponseAction(ACTION.TEMP, state.messages, action.payload) 
      }
        
    case APP.SET_PREFERENCE:
      return { 
        ...state, 
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload) 
      }

    case APP.DELETE_MESSAGE:
      return { 
        ...state, 
        messages: handleResponseAction(ACTION.TEMP, state.messages, action.payload) 
      }
      
  }
}