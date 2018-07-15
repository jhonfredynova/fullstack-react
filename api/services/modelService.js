module.exports = {

  deepPopulate: async (model, records, populate) => {
    try{
      let populateList = populate.split('.')
      let populateCurrent = { property: populateList[0], relation: populateList[1] }
      if (!populateCurrent.relation) return records
      for (let record of records){
        record[populateCurrent.property] = await sails.models[model._attributes[populateCurrent.property].collection].find({ id: _.map(record[populateCurrent.property], item => item.id) }).populate(populateCurrent.relation)
      }
      return records
    }catch(e){
      return records
    }
  },


  validateAssociations: async (model, data) => {
    try{
      //initalize
      let associationName = null
      let associationInstance = null
      let associationData = []
      let associationErrors = []
      let associationIds = []
      let associationFormat = (value) => {
        return _.isObject(value) ? _.get(value, 'id') : value
      }
      //loop in associations
      for (let association of model.associations){
        //validating only if it is required
        if (model._attributes[association.alias].required){
          //initialize model instance
          associationIds = []
          if (association.type==='collection') {
            associationName = association.collection
            data[association.alias] = _.map(data[association.alias], item => associationFormat(item))
            associationData = data[association.alias]
          }else{
            associationName = association.model
            data[association.alias] = associationFormat(data[association.alias])
            associationData = [data[association.alias]]
          }
          //cheking contraints
          associationInstance = sails.models[associationName]
          for (let item of associationData){
            if (!await associationInstance.findOne().where( { id: item })){
              associationIds.push(item)
            }
          }
          if (associationIds.length>0) {
            associationErrors.push(`The ${association.alias} assocation failed, no documents were found with that ID(s): ${associationIds.join(', ')}.`)
          }
        }
      }
      return associationErrors
    }catch(e){
      throw new Error(`There was an error validating associations.`)
    }
  }
}