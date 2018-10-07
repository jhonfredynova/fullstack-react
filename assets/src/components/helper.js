import { get, isArray, isObject, isString, join } from 'lodash'

//REQUESTS
export function handleRequestError(e){
  let message = null
  let messageDetail = get(e,'body', e.error) 
  if(isString(messageDetail) && !message) message = messageDetail
  if(isObject(messageDetail) && !message) message = get(messageDetail, 'message', null)
  if(isObject(messageDetail) && !message) message = get(messageDetail, 'raw', null)
  if(isObject(messageDetail) && !message) message = get(messageDetail, 'details', null)  
  if(!message) message = e.message
  throw new Error(message.replace(/"/g,""))
}

export function handleRequestQuery(data){
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

export function handleResponseQuery(response){
  return {
    records: response.data,
    totalRecords: parseInt(response.headers['content-records'], 0)
  }
}