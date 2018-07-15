'use strict'

let actionUtil = require('sails/lib/hooks/blueprints/actionUtil')

module.exports = async function findRecords(req, res) {
  try{
    // Look up the model and query params
    let params = await requestService.parseParams(req)
    let Model = actionUtil.parseModel(req)

    // If an `id` param was specified, use the findOne blueprint action
    // to grab the particular instance with its primary key === the value
    // of the `id` param.   (mainly here for compatibility for 0.9, where
    // there was no separate `findOne` action)
    if ( actionUtil.parsePk(req) ) {
      return require('./findOne')(req,res)
    }

    // Lookup for total records
    let totalRecords = await Model.find()
    .where( actionUtil.parseCriteria(req) )

    // Lookup for records that match the specified criteria
    let select = _.isEmpty(params.select) ? {} : { select: params.select } 
    let query = Model.find(select)
    .where( actionUtil.parseCriteria(req) )
    .limit( actionUtil.parseLimit(req) )
    .skip( actionUtil.parseSkip(req) )
    .sort( actionUtil.parseSort(req) )
    query = actionUtil.populateRequest(query, req)
    let matchingRecords = await new Promise((resolve, reject) => {
      query.exec((err, data) => {
        if(err) reject(err) 
        resolve(data)
      })
    })

    // Deep populate
    if (params.populate) {
      for (let populate of params.populate){
        matchingRecords = await modelService.deepPopulate(Model, matchingRecords, populate)
      }
    }
    
    // lookup and callback after find
    let afterFindCallback = sails.models[Model.adapter.identity].afterFind
    if (afterFindCallback) {
      matchingRecords = await afterFindCallback(matchingRecords)
    }

    // Updating sockets
    if (req._sails.hooks.pubsub && req.isSocket) {
      Model.subscribe(req, matchingRecords)
      if (req.options.autoWatch) { Model.watch(req) }
      // Also subscribe to instances of all associated models
      _.each(matchingRecords, function (record) {
        actionUtil.subscribeDeep(req, record)
      })
    }

    // Return response
    res.set('Access-Control-Expose-Headers', 'Content-Records')
    res.set('Content-Records', totalRecords.length)
    res.ok(matchingRecords)
  }catch(e){
    res.negotiate(e)
  }
}