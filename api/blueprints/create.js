'use strict'

let actionUtil = require('sails/lib/hooks/blueprints/actionUtil')

module.exports = async function createRecord(req, res) {
  try{
    let Model = actionUtil.parseModel(req)
    // Create data object (monolithic combination of all parameters)
    // Omit the blacklisted params (like JSONP callback param, etc.)
    let data = actionUtil.parseValues(req)
    //validatig associations
    let associationErrors = await modelService.validateAssociations(Model, data)
    if (associationErrors.length>0) {
      throw new Error(associationErrors.join(' '))
    }
    // Create new instance of model using data from params
    data = _.omit(data,['id'])
    let newInstance = await Model.create(data)
    // If we have the pubsub hook, use the model class's publish method
    // to notify all subscribers about the created item
    if (req._sails.hooks.pubsub) {
      if (req.isSocket) {
        Model.subscribe(req, newInstance)
        Model.introduce(newInstance)
      }
      Model.publishCreate(newInstance, !req.options.mirror && req)
    }
    // Send JSONP-friendly response if it's supported
    // populate it first
    newInstance = await Model.findOne({id:newInstance.id}).populateAll()
    res.created(newInstance)
  }catch(e){
    return res.negotiate(e)
  }
}