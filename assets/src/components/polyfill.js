import { compact, difference, isArray, isEmpty, isObject, trim } from 'lodash'
//COMMANDS
const supportedCommands = ['copy']
Object.defineProperty(document, 'queryCommandSupported', {
  value: (cmd) => supportedCommands.includes(cmd)
})

Object.defineProperty(document, 'execCommand', {
  value: (cmd) => supportedCommands.includes(cmd)
})

//EXTENDS
Object.cleanDeep = (object, value) => {
  for(let key in object) {
    if(isObject(object[key])) object[key] = Object.cleanDeep(object[key])
    else object[key] = value
  }
  return object
}

Object.compactDeep = (object, customizer) => {
  customizer = customizer || ((item) => Object.isEmpty(item))
  for(let key in object){
    if(isArray(object[key])) object[key] = compact(Object.compactDeep(object[key]), customizer)
    if(isObject(object[key])) object[key] = Object.compactDeep(object[key], customizer)
    if(customizer(object[key], key)) delete object[key]
  }
  return object
}

Object.includes = (objSource, objSearch, mustHaveAll) => {
  let unmatchedItems = difference(objSource, objSearch)
  return mustHaveAll ? unmatchedItems.length===0 : unmatchedItems.length<objSource.length
}

Object.isEmail = (value) => {
  let regExpEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
  return regExpEmail.test(value)
}

Object.isEmpty = (value) => {
  value = isObject(value) ? value : trim(value)
  return isEmpty(value)
}

Object.isHtml = (value) => {
  let div = document.createElement('div')
  div.innerHTML = value
  for (let c = div.childNodes, i = c.length; i--; ) {
    if (c[i].nodeType===1) return true
  }
  return false
}

Object.setDeep = (object, property, customizer) => {
  customizer = customizer || ((item) => item)
  for(let key in object) {
    if(isObject(object[key])) object[key] = Object.setDeep(object[key], property, customizer)
    if(key===property) object[key] = customizer(object[key], key)
  }
  return object
}

Object.toUrl = (value) => {
  let encodedUrl = value.toString().toLowerCase()
  encodedUrl = encodedUrl.replace(/[^\w ]+/g,'')
  encodedUrl = encodedUrl.replace(/ +/g,'-')
  return encodedUrl
}