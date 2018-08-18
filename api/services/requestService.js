let actionUtil = require('sails/lib/hooks/blueprints/actionUtil')

module.exports = {

  applyCriteria: (criteria, data) => {
    try{
      let constraint = null
      let constraintValue = null
      let dataValue = null
      let dataResult = []
      criteria = _.pick(criteria, _.keys(data))
      criteria = _.mapValues(criteria, item => _.isArray(item) ? { 'in': item } : item)
      for(let key in criteria){
        constraint = _.isObject(criteria[key]) ? _.first(Object.keys(criteria[key])) : null
        constraintValue = constraint ? criteria[key][constraint] : criteria[key]
        dataValue = data[key]
        if(!dataValue) continue
        switch(constraint){
          case '<':
            dataResult.push(dataValue<constraintValue)
            break
          case '<=':
            dataResult.push(dataValue<=constraintValue)
            break
          case '>':
            dataResult.push(dataValue>constraintValue)
            break
          case '>=':
            dataResult.push(dataValue>=constraintValue)
            break
          case '!=':
            dataResult.push(dataValue!==constraintValue)
            break
          case 'in':
            dataResult.push(constraintValue.includes(dataValue))
            break
          case 'nin':
            dataResult.push(!constraintValue.includes(dataValue))
            break
          case 'like':
            dataResult.push(new RegExp('^' + _.escapeRegExp(constraintValue).replace(/^%/, '.*').replace(/([^\\])%/g, '$1.*').replace(/\\%/g, '%') + '$', 'i').test(dataValue))
            break
          default:
            dataResult.push(new RegExp(`^${constraintValue}$`,'i').test(dataValue))
            break
        }
      }
      return Object.keys(criteria).length===dataResult.filter(item => item).length
    }catch(e){
      return false
    }
  },

  applyConstrains: (criteria) => {
    try{
      return (item) => {
        let response = requestService.applyCriteria(criteria, item)
        if(response && criteria.or){
          response = criteria.or.find(criteriaItem => requestService.applyCriteria(criteriaItem, item))
        }
        return response
      }
    }catch(e){
      return true
    }
  },

  applyFilter: (criteria, data) => {
    try{
      if(criteria.where) data = data.filter(requestService.applyConstrains(criteria.where))
      if(criteria.select) data = _.map(data, item => _.pick(item, criteria.select))
      if(criteria.omit) data = _.map(data, item => _.omit(item, criteria.omit))
      if(criteria.sort) data = _.sortByOrder(data, criteria.sort.map(item => Object.keys(item)[0]), criteria.sort.map(item => _.values(item)[0].toLowerCase()))
      if(criteria.limit) data = data.slice(criteria.skip, (criteria.skip+criteria.limit))
      return data
    }catch(e){
      return data
    }
  },

  applyPagination: (res, criteria, data, totalData) => {
    try{
      if(_.get(criteria, 'where.id')) return _.first(data)
      res.set('Access-Control-Expose-Headers', 'Content-Records')
      res.set('Content-Records', totalData)
      return data
    }catch(e){
      return data
    }
  },

  parseCriteria: (req) => {
    try{
      return Object.compactDeep({
        limit: actionUtil.parseLimit(req),
        skip: actionUtil.parseSkip(req),
        sort: actionUtil.parseSort(req),
        where: _.omit(actionUtil.parseCriteria(req), ['limit', 'skip', 'sort', 'populate', 'select', 'omit']),
        select: req.param('select') ? req.param('select').split(',').map(function(attribute) {return attribute.trim()}) : null,
        omit: req.param('omit') ? req.param('omit').split(',').map(function(attribute) {return attribute.trim()}): null
      })
    }catch(e){
      return {}
    }
  }

}