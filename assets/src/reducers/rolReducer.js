import { ROL } from 'actions/rolActions'

export default function reducer(
  state={
    roles: { records: [], totalRecords: 0 },
    temp: null
  }, 
  action={}) 
{
  switch (action.type) {

    default:
      return state

    case ROL.GET:
      return {
        ...state,
        roles: {
          ...state.roles,
          records: action.payload.records,
          totalRecords: action.payload.totalRecords
        }
      }

    case ROL.SAVE:
      return {
        ...state,
        roles: {
          ...state.roles,
          records: state.roles.records.concat(action.payload),
          totalRecords: state.roles.totalRecords+1
        }
      }

    case ROL.UPDATE:
      return { 
        ...state, 
        roles: {
          ...state.roles,
          records: state.roles.records.map(item => (item.id===action.payload.id) ? action.payload : item)
        }
      }

    case ROL.DELETE:
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