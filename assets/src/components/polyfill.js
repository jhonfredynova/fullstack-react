import { assignWith, defaultTo, hasIn, isArray, isEmpty, isObject, trim, get, set } from 'lodash'
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
Object.compactDeep = (object) => {
  for(let key in object) {
    if(Object.isEmpty(object[key])) delete object[key]
    if(isObject(object[key])){
      object[key] = Object.compactDeep(object[key])
      if(Object.isEmpty(object[key])) delete object[key]
    }
  }
  return object
}
Object.defaultComponentTo = (objSource, objDefault) => {
  if (!isArray(objSource) && isObject(objSource)){
    return assignWith(objSource, objDefault, (sourceItem, defaultItem) => Object.isEmpty(get(sourceItem, 'props.children')) ? defaultTo(defaultItem, null) : defaultTo(sourceItem, null))
  }
  return defaultTo(get(objSource, 'props.children'), objDefault)
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
Object.setDeep = (object, property, value) => {
  for(let key in object) {
    if(hasIn(object[key], property)) object[key] = set(object[key], property, value)
    else if(isObject(object[key])) object[key] = Object.setDeep(object[key], property, value)
  }
  return object
}
Object.toUrl = (value) => {
  let encodedUrl = value.toString().toLowerCase()
  encodedUrl = encodedUrl.replace(/[^\w ]+/g,'')
  encodedUrl = encodedUrl.replace(/ +/g,'-')
  return encodedUrl
}