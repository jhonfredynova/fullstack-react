'use strict'

/**
 * Module dependencies
 */
let actionUtil = require('sails/lib/hooks/blueprints/actionUtil')

/**
 * Find One Record
 *
 * get /:modelIdentity/:id
 *
 * An API call to find and return a single model instance from the data adapter
 * using the specified id.
 *
 * Required:
 * @param {Integer|String} id  - the unique id of the particular instance you'd like to look up *
 *
 * Optional:
 * @param {String} callback - default jsonp callback param (i.e. the name of the js function returned)
 */

module.exports = async function findOneRecord(req, res) {
  try{
    let Model = actionUtil.parseModel(req)
    let pk = actionUtil.requirePk(req)

    let query = Model.findOne(pk)
    query = actionUtil.populateRequest(query, req)
    let matchingRecord = await new Promise((resolve, reject) => {
      query.exec((err, data) => {
        if(err) reject(err) 
        resolve(data)
      })
    })
    if(!matchingRecord) return res.ok(null)
    if (req._sails.hooks.pubsub && req.isSocket) {
      Model.subscribe(req, matchingRecord)
      actionUtil.subscribeDeep(req, matchingRecord)
    }

    let afterFindCallback = sails.models[Model.adapter.identity].afterFind
    if (afterFindCallback) {
      matchingRecord = await afterFindCallback([matchingRecord])
      matchingRecord = _.first(matchingRecord)
    }
    
    res.ok(matchingRecord)
  }catch(e){
    return res.negotiate(e)
  }
}
