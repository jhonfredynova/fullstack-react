module.exports = {

  compact: (object, deep) => {
    for(let key in object) {
      if(polyfillService.isEmpty(object[key])) delete object[key]
      if(_.isObject(object[key])){
        object[key] = polyfillService.compactDeep(object[key])
        if(polyfillService.isEmpty(object[key])) delete object[key]
      }
    }
    return object
  },

  isEmpty: (value) => {
    value = _.isObject(value) ? value : _.trim(value)
    return _.isEmpty(value)
  }

}