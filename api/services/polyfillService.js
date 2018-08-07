let compact = require('lodash/compact')
let difference = require('lodash/difference')
let isArray = require('lodash/isArray')
let isEmpty = require('lodash/isEmpty')
let isObject = require('lodash/isObject')
let trim = require('lodash/trim')

//EXTENDS
Object.compactDeep = (object) => {
  for(let key in object){
    if(isArray(object[key])) object[key] = compact(Object.compactDeep(object[key]))
    if(isObject(object[key])) object[key] = Object.compactDeep(object[key])
    if(Object.isEmpty(object[key])) delete object[key]
  }
  return object
}


Object.includes = (objSource, objSearch, mustHaveAll) => {
  let unmatchedItems = difference(objSource, objSearch)
  return mustHaveAll ? unmatchedItems.length===0 : unmatchedItems.length<objSource.length
}

Object.isEmpty = (value) => {
  value = isObject(value) ? value : trim(value)
  return isEmpty(value)
}