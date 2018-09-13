import { CHAT, CHAT_MESSAGE } from 'actions/chatActions'

export default function reducer(
  state={
    chats: { records: [], totalRecords: 0 },
    messages: { records: [], totalRecords: 0 },
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
        chats: {
          ...state.chats,
          records: action.payload.records,
          totalRecords: action.payload.totalRecords
        }
      }

    case CHAT.SAVE:
      return {
        ...state,
        chats: {
          ...state.chats,
          records: state.chats.records.concat(action.payload),
          totalRecords: state.chats.totalRecords+1
        }
      }

    case CHAT.UPDATE:
      return { 
        ...state, 
        chats: {
          ...state.chats,
          records: state.chats.records.map(item => (item.id===action.payload.id) ? action.payload : item)
        }
      }

    case CHAT.DELETE:
      return { 
        ...state, 
        chats: {
          ...state.chats,
          records: state.chats.records.filter(item => item.id!==action.payload.id),
          totalRecords: state.chats.totalRecords-1
        }
      }
      
    case CHAT_MESSAGE.GET:
      return {
        ...state,
        messages: {
          ...state.messages,
          records: action.payload.records,
          totalRecords: action.payload.totalRecords
        }
      }

    case CHAT_MESSAGE.SAVE:
      return {
        ...state,
        messages: {
          ...state.messages,
          records: state.messages.records.concat(action.payload),
          totalRecords: state.messages.totalRecords+1
        }
      }

    case CHAT_MESSAGE.UPDATE:
      return { 
        ...state, 
        messages: {
          ...state.messages,
          records: state.messages.records.map(item => (item.id===action.payload.id) ? action.payload : item)
        }
      }

    case CHAT_MESSAGE.DELETE:
      return { 
        ...state, 
        messages: {
          ...state.messages,
          records: state.messages.records.filter(item => item.id!==action.payload.id),
          totalRecords: state.messages.totalRecords-1
        }
      }

  }
}