import { CATALOG } from 'actions/catalogActions'

export default function reducer(
  state={
    catalogs: { records: [], totalRecords: 0 },
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
        catalogs: {
          ...state.catalogs,
          records: action.payload.records,
          totalRecords: action.payload.totalRecords
        }
      }

    case CATALOG.SAVE:
      return {
        ...state,
        catalogs: {
          ...state.catalogs,
          records: state.catalogs.records.concat(action.payload),
          totalRecords: state.catalogs.totalRecords+1
        }
      }

    case CATALOG.UPDATE:
      return { 
        ...state, 
        catalogs: {
          ...state.catalogs,
          records: state.catalogs.records.map(item => (item.id===action.payload.id) ? action.payload : item)
        }
      }

    case CATALOG.DELETE:
      return { 
        ...state, 
        catalogs: {
          ...state.catalogs,
          records: state.catalogs.records.filter(item => item.id!==action.payload.id),
          totalRecords: state.catalogs.totalRecords-1
        }
      }
      
  }
}