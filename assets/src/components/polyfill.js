import _ from 'lodash'
import localStorage from 'localStorage'
import 'matchmedia-polyfill'
import 'matchmedia-polyfill/matchMedia.addListener'

//WINDOW
if(!window.localStorage) window.localStorage = localStorage
if(!window.matchMedia) window.matchMedia = matchMedia

//COMMANDS
const supportedCommands = ['copy']
Object.defineProperty(document, 'queryCommandSupported', {
  value: (cmd) => supportedCommands.includes(cmd)
})

Object.defineProperty(document, 'execCommand', {
  value: (cmd) => supportedCommands.includes(cmd)
})

//LODASH
const lodashSet = _.set
_.mixin({
  clean: (object, value) => {
    let exec = (object) => {
      for(let key in object) {
        if(_.isObject(object[key])) object[key] = exec(object[key], value)
        else object[key] = value
      }
      return object
    }
    return exec(_.cloneDeep(object))
  },
  compact: (value) => {
    let exec = (value) => {
      for(let key in value){
        if(_.isObject(value[key])) value[key] = exec(value[key])
        if(_.isEmpty(value[key])) delete value[key]
        if(_.isArray(value)) value = value.filter(item => !_.isEmpty(item))
      }
      return value
    }
    return exec(_.cloneDeep(value))
  },
  includes: (collection, value, mustHaveAll=false) => {
    let unmatchedItems = _.difference(collection, value)
    return mustHaveAll ? unmatchedItems.length===0 : unmatchedItems.length<collection.length
  },
  isEmail: (value) => {
    let regExpEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
    return regExpEmail.test(value)
  },
  isEmpty: (value) => {
    if(_.isObject(value)) return Object.keys(value).length===0
    return _.trim(value).length===0
  },
  isHtml: (value) => {
    let div = document.createElement('div')
    div.innerHTML = value
    for (let c = div.childNodes, i = c.length; i--; ) {
      if (c[i].nodeType===1) return true
    }
    return false
  },
  set: (object, path, value) => {
    return lodashSet(_.cloneDeep(object), path, value)
  },
  setDeep: (object, property, value) => {
    let exec = (object, property, value) => {
      for(let key in object) {
        if(_.isObject(object[key])) object[key] = exec(object[key], property, value)
        if(key===property) object[key] = value
      }
      return object
    }
    return exec(_.cloneDeep(object), property, value)
  },
  toUrl: (value) => {
    let encodedUrl = value.toString().toLowerCase()
    encodedUrl = encodedUrl.replace(/[^\w ]+/g,'')
    encodedUrl = encodedUrl.replace(/ +/g,'-')
    return encodedUrl
  }
})