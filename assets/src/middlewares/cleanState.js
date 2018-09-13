import { APP } from 'actions/appActions'

const CleanState = store => next => action => {
  if(action.type===APP.SHOW_LOADING) {
    for(let key in store.getState()){
      store.getState()[key].temp = null
    }
  }
  next(action)
}

export default CleanState