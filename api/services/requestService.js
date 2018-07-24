 let actionUtil = require('sails/lib/hooks/blueprints/actionUtil')

 module.exports = {

  parseParams: async (req) => {
    try{
      let params = req.query
      let response = {}
      for(let key of Object.keys(params)){
        try{
          response[key] = JSON.parse(params[key])
          if(key==='populate'){
            req.query[key] = await requestService.parsePopulate(req, req.query.populate)
          }
          if(key==='where'){
            response[key] = await requestService.parseWhere(req, response[key])
            req.query[key] = response[key]
          }
        }catch(e){
          response[key] = params[key]
        }
      }
      return response
    }catch(e){
      throw e
    }
  },

  parsePopulate: async (req, populate) => {
    try{
      return populate.replace(/["']/g, "")
    }catch(e){
      return populate
    }
  },

  parseWhere: async (req, criteria, criteriaKey) => {
    try{
      let associationAlias = null
      let model =  actionUtil.parseModel(req)
      // formatting search criteria
      let formatCriteria = async (model, criteria, criteriaKey) => {
        try{
          if(criteriaKey.includes('.')){
            associationAlias = criteriaKey.split('.')[0]
            if(!Object.isEmpty(Object.compactDeep(criteria[criteriaKey]))) {
              criteria[criteriaKey] = await sails.models[model._attributes[associationAlias].model].find({ select: ['id'] }).where({ [criteriaKey.split('.')[1]]: criteria[criteriaKey] })
              criteria[associationAlias] = _.map(criteria[criteriaKey], item => item.id)
            }
            delete criteria[criteriaKey]
          }
          return criteria[criteriaKey]
        }catch(e){
          return criteria[criteriaKey]
        }
      }
      // looping in criteria
      for(let criteriaKey in criteria){
        // idCondition
        if(criteriaKey==='id'){
          req.query[criteriaKey] = Object.isEmpty(criteria[criteriaKey])? '-1' : criteria[criteriaKey]
        }
        // orCondition
        else if(criteriaKey==='or'){
          for(let condition of criteria[criteriaKey]){
            for(let conditionKey in condition){
              condition = await formatCriteria(model, condition, conditionKey)
            }
          } 
        }
        // otherwhise
        else{
          criteria[criteriaKey] = await formatCriteria(model, criteria, criteriaKey)
        }

      }
      return criteria
    }catch(e){
      return criteria
    }
  }

}