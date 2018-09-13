import { PLAN, PLAN_FEATURE } from 'actions/planActions'

export default function reducer(
  state={
    plans: { records: [], totalRecords: 0 },
    features: { records: [], totalRecords: 0 },
    temp: null
  }, 
  action={}) 
{
  switch (action.type) {

    default:
      return state
    
    case PLAN.GET:
      return {
        ...state,
        plans: {
          ...state.plans,
          records: action.payload.records,
          totalRecords: action.payload.totalRecords
        }
      }

    case PLAN.SAVE:
      return {
        ...state,
        plans: {
          ...state.plans,
          records: state.plans.records.concat(action.payload),
          totalRecords: state.plans.totalRecords+1
        }
      }

    case PLAN.UPDATE:
      return { 
        ...state, 
        plans: {
          ...state.plans,
          records: state.plans.records.map(item => (item.id===action.payload.id) ? action.payload : item)
        }
      }

    case PLAN.DELETE:
      return { 
        ...state, 
        plans: {
          ...state.plans,
          records: state.plans.records.filter(item => item.id!==action.payload.id),
          totalRecords: state.plans.totalRecords-1
        }
      }

    case PLAN_FEATURE.GET:
      return {
        ...state,
        features: {
          ...state.features,
          records: action.payload.records,
          totalRecords: action.payload.totalRecords
        }
      }

    case PLAN_FEATURE.SAVE:
      return {
        ...state,
        features: {
          ...state.features,
          records: state.features.records.concat(action.payload),
          totalRecords: state.features.totalRecords+1
        }
      }

    case PLAN_FEATURE.UPDATE:
      return { 
        ...state, 
        features: {
          ...state.features,
          records: state.features.records.map(item => (item.id===action.payload.id) ? action.payload : item)
        }
      }

    case PLAN_FEATURE.DELETE:
      return { 
        ...state, 
        features: {
          ...state.features,
          records: state.features.records.filter(item => item.id!==action.payload.id),
          totalRecords: state.features.totalRecords-1
        }
      }

  }
}