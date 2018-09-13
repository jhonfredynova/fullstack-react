import { APP } from 'actions/appActions'

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
        isLoading: action.payload
      }
      
    case APP.SHOW_LOADING:
      return { 
        ...state, 
        isLoading: action.payload
      }

    case APP.GET_CONFIG:
      return { 
        ...state, 
        config: action.payload
      }

    case APP.SET_MESSAGE:
      return { 
        ...state, 
        messages: action.payload
      }
        
    case APP.SET_PREFERENCE:
      return { 
        ...state, 
        temp: action.payload
      }

    case APP.DELETE_MESSAGE:
      return { 
        ...state, 
        messages: action.payload
      }
      
  }
}