'use strict'

let actionUtil = require('sails/lib/hooks/blueprints/actionUtil')


module.exports = async function expand(req, res) {
  try{
    let Model = actionUtil.parseModel(req)
    let relation = req.options.alias
    if (!relation || !Model) return res.serverError()

    // Allow customizable blacklist for params.
    req.options.criteria = req.options.criteria || {}
    req.options.criteria.blacklist = req.options.criteria.blacklist || ['limit', 'skip', 'sort', 'id', 'parentid']

    let parentPk = req.param('parentid')

    // Determine whether to populate using a criteria, or the
    // specified primary key of the child record, or with no
    // filter at all.
    let childPk = actionUtil.parsePk(req)

    // Coerce the child PK to an integer if necessary
    if (childPk) {
      if (Model.attributes[Model.primaryKey].type == 'integer') {
        childPk = +childPk || 0
      }
    }

    let where = childPk ? {id: [childPk]} : actionUtil.parseCriteria(req)

    let populate = sails.util.objCompact({
      where: where,
      skip: actionUtil.parseSkip(req),
      limit: actionUtil.parseLimit(req),
      sort: actionUtil.parseSort(req)
    })

    let totalRecords = await Model.findOne(parentPk).populate(relation, populate)
    let matchingRecord = await Model.findOne(parentPk).populate(relation, populate)
    if (!matchingRecord) return res.notFound('No record found with the specified id.')
    if (!matchingRecord[relation]) return res.notFound(util.format('Specified record (%s) is missing relation `%s`', parentPk, relation))
    
    // Subcribe to instance, if relevant
    // TODO: only subscribe to populated attribute- not the entire model
    if (sails.hooks.pubsub && req.isSocket) {
      Model.subscribe(req, matchingRecord)
      actionUtil.subscribeDeep(req, matchingRecord)
    }

    // Returning results
    res.set('Access-Control-Expose-Headers', 'Content-Records')
    res.set('Content-Records', totalRecords[relation].length)
    return res.ok(matchingRecord[relation])
  }catch(e){
    return res.negotiate(e)
  }
}
