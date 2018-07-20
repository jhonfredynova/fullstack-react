import { PLAN, PLAN_FEATURE } from 'actions/planActions'
import { ACTION, handleResponseAction } from 'components/helper'

export default function reducer(
  state={
    plans: { records: [], recordsTotal: 0 },
    features: { records: [], recordsTotal: 0 },
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
        plans: handleResponseAction(ACTION.GET, state.plans, action.payload.find || state.plans),
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload.findOne)
      }

    case PLAN.SAVE:
      return { 
        ...state, 
        plans: handleResponseAction(ACTION.SAVE, state.plans, action.payload) 
      }

    case PLAN.UPDATE:
      return { 
        ...state, 
        plans: handleResponseAction(ACTION.UPDATE, state.plans, action.payload) 
      }

    case PLAN.DELETE:
      return { 
        ...state, 
        plans: handleResponseAction(ACTION.DELETE, state.plans, action.payload) 
      }

    case PLAN_FEATURE.GET:
      return { 
        ...state, 
        features: handleResponseAction(ACTION.GET, state.features, action.payload.find || state.features),
        temp: handleResponseAction(ACTION.TEMP, state.temp, action.payload.findOne)
      }
      
    case PLAN_FEATURE.SAVE:
      return { 
        ...state, 
        features: handleResponseAction(ACTION.SAVE, state.features, action.payload) 
      }

    case PLAN_FEATURE.UPDATE:
      return { 
        ...state, 
        features: handleResponseAction(ACTION.UPDATE, state.features, action.payload) 
      }

    case PLAN_FEATURE.DELETE:
      return { 
        ...state, 
        features: handleResponseAction(ACTION.DELETE, state.features, action.payload) 
      }

  }
}