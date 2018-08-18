import { cloneDeep, get, isNull, isArray, isObject, isString, join } from 'lodash'

//CONSTANTS
export const ACTION = {
  TEMP: 'ACTION_TEMP',
  DELETE: 'ACTION_DELETE',
  GET: 'ACTION_GET',
  SAVE: 'ACTION_SAVE',
  UPDATE: 'ACTION_UPDATE',
  UPLOAD: 'ACTION_UPLOAD'
}

//REQUESTS
export function handleError(e){
  let message = null
  let messageDetail = get(e,'response.data', null) 
  if(isString(messageDetail) && !message) message = messageDetail
  if(isObject(messageDetail) && !message) message = get(messageDetail, 'message', null)
  if(isObject(messageDetail) && !message) message = get(messageDetail, 'raw', null)
  if(isObject(messageDetail) && !message) message = get(messageDetail, 'details', null)  
  if(!message) message = e.message
  throw new Error(message)
}

export function handleRequestQuery(data){
  data = Object.compactDeep(cloneDeep(data), item => !isNull(item) && Object.isEmpty(item))
  let params = {}
  for(let key in data){
    if(key==='activePage') params.skip = (data.activePage<=1 ? 0 : ((data.activePage-1)*data.pageSize))
    else if(key==='pageSize') params.limit = data.pageSize
    else if(key==='populate') params.populate = isArray(data.populate) ? join(data.populate,',') : data.populate
    else if(key==='select') params.select = join(data.select,',')
    else if(key==='sort') params.sort = data.sort
    else if(key==='where') params.where = data.where
    else params[key] = data[key]
  }
  let queryString = []
  let queryValue = null
  for(let param in params){
    queryValue = isObject(params[param]) ? JSON.stringify(params[param]) : params[param]
    queryString.push(`${param}=${queryValue}`)
  }
  return encodeURI(queryString.join('&'))
}

export function handleResponseAction(action, state, payload){
  switch(action){
    case ACTION.TEMP:
      state = payload
      break
    case ACTION.DELETE:
      state = {
        ...state,
        records: state.records.filter(item => item.id!==payload.id),
        recordsTotal: state.recordsTotal-1
      }
      break
    case ACTION.GET:
      state = {
        ...state,
        records: payload.records,
        recordsTotal: payload.recordsTotal
      }
      break
    case ACTION.SAVE:
      state = {
        ...state,
        records: state.records.concat(payload),
        recordsTotal: state.recordsTotal+1
      }
      break
    case ACTION.UPDATE:
      state = {
        ...state, 
        records: state.records.map(item => (item.id===payload.id) ? payload : item),
        recordsTotal: state.recordsTotal
      }
      break
    case ACTION.UPLOAD:
      state = {
        ...state,
        records: state.records.concat(payload),
        recordsTotal: state.recordsTotal+payload.length
      }
      break
    default:
      break
  }
  return state
}

export function handleResponseQuery(data){
  let response = { find: null, findOne: null }
  if(data.headers['content-records']){
    response.find = {}
    response.find.records = data.data
    response.find.recordsTotal = parseInt(data.headers['content-records'], 0)
  }else{
    response.findOne = data.data
  }
  return response
}