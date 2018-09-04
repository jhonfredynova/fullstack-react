import { APP } from 'actions/appActions'

const CleanState = store => next => action => {
  if (action.type===APP.SHOW_LOADING) {
    store.getState().app.messages = [] 
    for(let key in store.getState()){
      store.getState()[key].temp = null
    }
  }
  next(action)
}

export default CleanState