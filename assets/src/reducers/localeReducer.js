import { LOCALE } from 'actions/localeActions'

export default function reducer(
  state={
    locales: { records: [], totalRecords: 0 },
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
        locales: {
          ...state.locales,
          records: action.payload.records,
          totalRecords: action.payload.totalRecords
        }
      }

    case LOCALE.SAVE:
      return {
        ...state,
        locales: {
          ...state.locales,
          records: state.locales.records.concat(action.payload),
          totalRecords: state.locales.totalRecords+1
        }
      }

    case LOCALE.UPDATE:
      return { 
        ...state, 
        locales: {
          ...state.locales,
          records: state.locales.records.map(item => (item.id===action.payload.id) ? action.payload : item)
        }
      }

    case LOCALE.DELETE:
      return { 
        ...state, 
        locales: {
          ...state.locales,
          records: state.locales.records.filter(item => item.id!==action.payload.id),
          totalRecords: state.locales.totalRecords-1
        }
      }
      
  }
}