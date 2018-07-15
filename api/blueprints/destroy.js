'use strict';

let actionUtil = require('sails/lib/hooks/blueprints/actionUtil')

module.exports = async function destroyOneRecord(req, res) {
  try{
    let Model = actionUtil.parseModel(req)
    let pk = actionUtil.requirePk(req)
    //quering record
    let record = await Model.findOne({ id: pk })
    if(!record) return res.notFound('No record found with the specified `id`.')
    //updating record
    record.active = false
    let records = await Model.update(pk, record.toJSON())
    record = records[0]
    //updating socket events
    if (req._sails.hooks.pubsub) {
      //Model.publishDestroy(pk, !req._sails.config.blueprints.mirror && req, {previous: record})
      if (req.isSocket) {
        Model.unsubscribe(req, record)
        Model.retire(record)
      }
    }
    return res.ok(record)
  }catch(e){
    return res.negotiate(e)
  }
}