import { applyMiddleware, createStore } from "redux"
import { createLogger } from 'redux-logger'
import thunk from "redux-thunk"
import promise from "redux-promise-middleware"
import cleanState from 'middlewares/cleanState'
import requestHeader from 'middlewares/requestHeader'
import reducer from "reducers"

const middleware = applyMiddleware(promise(), thunk, createLogger(), cleanState, requestHeader)

export default createStore(reducer, middleware)