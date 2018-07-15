import { applyMiddleware, createStore } from "redux"
import { createLogger } from 'redux-logger'
import thunk from "redux-thunk"
import promise from "redux-promise-middleware"
import cleanState from 'middlewares/cleanState'
import setHeader from 'middlewares/setHeader'
import reducer from "reducers"

const middleware = applyMiddleware(promise(), thunk, createLogger(), cleanState, setHeader)

export default createStore(reducer, middleware)