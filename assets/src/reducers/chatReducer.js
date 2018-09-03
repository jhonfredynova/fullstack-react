import { CHAT, CHAT_MESSAGE } from 'actions/chatActions'
import { ACTION, handleResponseAction } from 'components/helper'

export default function reducer(
  state={
    chats: { records: [], recordsTotal: 0 },
    messages: { records: [], recordsTotal: 0 },
    temp: null
  }, 
  action={}) 
{
  switch (action.type) {

    default:
      return state

    case CHAT.GET:
      return { 
        ...state, 
        chats: handleResponseAction(ACTION.GET, state.chats, action.payload.find || state.chats),
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload.findOne)
      }

    case CHAT.SAVE:
      return { 
        ...state, 
        chats: handleResponseAction(ACTION.SAVE, state.chats, action.payload) 
      }

    case CHAT.UPDATE:
      return { 
        ...state, 
        chats: handleResponseAction(ACTION.UPDATE, state.chats, action.payload) 
      }

    case CHAT.DELETE:
      return { 
        ...state, 
        chats: handleResponseAction(ACTION.DELETE, state.chats, action.payload) 
      }
    case CHAT_MESSAGE.GET:
      return { 
        ...state, 
        messages: handleResponseAction(ACTION.GET, state.messages, action.payload.find || state.messages),
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload.findOne)
      }
      
    case CHAT_MESSAGE.SAVE:
      return { 
        ...state, 
        messages: handleResponseAction(ACTION.SAVE, state.messages, action.payload) 
      }

    case CHAT_MESSAGE.UPDATE:
      return { 
        ...state, 
        messages: handleResponseAction(ACTION.UPDATE, state.messages, action.payload) 
      }

    case CHAT_MESSAGE.DELETE:
      return { 
        ...state, 
        messages: handleResponseAction(ACTION.DELETE, state.messages, action.payload) 
      }

  }
}