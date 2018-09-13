import { USER, USER_ROL } from 'actions/userActions'

export default function reducer(
  state={
    users: { records: [], totalRecords: 0 },
    roles: { records: [], totalRecords: 0 },
    temp: null
  }, 
  action={}) 
{
  switch (action.type) {

    default:
      return state

    case USER.GET:
      return {
        ...state,
        users: {
          ...state.users,
          records: action.payload.records,
          totalRecords: action.payload.totalRecords
        }
      }

    case USER.SAVE:
      return {
        ...state,
        users: {
          ...state.users,
          records: state.users.records.concat(action.payload),
          totalRecords: state.users.totalRecords+1
        }
      }

    case USER.UPDATE:
      return { 
        ...state, 
        users: {
          ...state.users,
          records: state.users.records.map(item => (item.id===action.payload.id) ? action.payload : item)
        }
      }

    case USER.DELETE:
      return { 
        ...state, 
        users: {
          ...state.users,
          records: state.users.records.filter(item => item.id!==action.payload.id),
          totalRecords: state.users.totalRecords-1
        }
      }

    case USER.FORGOT:
      return { 
        ...state, 
        temp: action.payload
      }

    case USER.RESET:
      return { 
        ...state, 
        temp: action.payload
      }

    case USER.VALIDATE:
      return { 
        ...state, 
        temp: action.payload
      }

    case USER_ROL.GET:
      return {
        ...state,
        roles: {
          ...state.roles,
          records: action.payload.records,
          totalRecords: action.payload.totalRecords
        }
      }

    case USER_ROL.SAVE:
      return {
        ...state,
        roles: {
          ...state.roles,
          records: state.roles.records.concat(action.payload),
          totalRecords: state.roles.totalRecords+1
        }
      }

    case USER_ROL.UPDATE:
      return { 
        ...state, 
        roles: {
          ...state.roles,
          records: state.roles.records.map(item => (item.id===action.payload.id) ? action.payload : item)
        }
      }

    case USER_ROL.DELETE:
      return { 
        ...state, 
        roles: {
          ...state.roles,
          records: state.roles.records.filter(item => item.id!==action.payload.id),
          totalRecords: state.roles.totalRecords-1
        }
      }
    
  }
}