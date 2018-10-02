import { SOCKET } from 'actions/socketActions'

export default function reducer(
  state={
    temp: null
  }, 
  action={}) 
{
  switch (action.type) {

    default:
      return state

    case SOCKET.CONNECT:
      return { 
        ...state, 
        temp: action.payload
      }
    
    case SOCKET.ON:
      return { 
        ...state, 
        temp: action.payload
      }

    case SOCKET.OFF:
      return { 
        ...state, 
        temp: action.payload
      }
      
  }
}