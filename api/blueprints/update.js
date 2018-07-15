/**
 * Module dependencies
 */

let actionUtil = require('sails/lib/hooks/blueprints/actionUtil')
let util = require('util')


/**
 * Update One Record
 *
 * An API call to update a model instance with the specified `id`,
 * treating the other unbound parameters as attributes.
 *
 * @param {Integer|String} id  - the unique id of the particular record you'd like to update  (Note: this param should be specified even if primary key is not `id`!!)
 * @param *                    - values to set on the record
 *
 */
module.exports = async function updateOneRecord(req, res) {

  try{
    // Look up the model
    let Model = actionUtil.parseModel(req)
    // Locate and validate the required `id` parameter.
    let pk = actionUtil.requirePk(req)
    // Default the value blacklist to just "id", so that models that have an
    // "id" field that is _not_ the primary key don't have the id field
    // updated mistakenly.  See https://github.com/balderdashy/sails/issues/3625
    req.options.values = req.options.values || {}
    req.options.values.blacklist = req.options.values.blacklist || ['id']
    // Create `values` object (monolithic combination of all parameters)
    // But omit the blacklisted params (like JSONP callback param, etc.)
    let values = actionUtil.parseValues(req)
    // No matter what, don't allow changing the PK via the update blueprint
    // (you should just drop and re-add the record if that's what you really want)
    if (typeof values[Model.primaryKey] !== 'undefined' && values[Model.primaryKey] != pk) {
      req._sails.log.warn('Cannot change primary key via update blueprint; ignoring value sent for `' + Model.primaryKey + '`')
    }
    // Make sure the primary key is unchanged
    values[Model.primaryKey] = pk
    // Find and update the targeted record.
    //
    // (Note: this could be achieved in a single query, but a separate `findOne`
    //  is used first to provide a better experience for front-end developers
    //  integrating with the blueprint API.)
    let query = Model.findOne(pk)
    // Populate the record according to the current "populate" settings
    query = actionUtil.populateRequest(query, req)
    let matchingRecord = await Model.findOne(pk)
    if (!matchingRecord) return res.notFound()

    //validatig associations
    let associationErrors = await modelService.validateAssociations(Model, values)
    if (associationErrors.length>0) {
      throw new Error(associationErrors.join(' '))
    }

    let records = await Model.update(pk, values)
    // Because this should only update a single record and update
    // returns an array, just use the first item.  If more than one
    // record was returned, something is amiss.
    if (!records || !records.length || records.length > 1) {
      req._sails.log.warn(
      util.format('Unexpected output from `%s.update`.', Model.globalId)
      )
    }

    let updatedRecord = records[0]

    // If we have the pubsub hook, use the Model's publish method
    // to notify all subscribers about the update.
    if (req._sails.hooks.pubsub) {
      if (req.isSocket) { Model.subscribe(req, records); }
      Model.publishUpdate(pk, _.cloneDeep(values), !req.options.mirror && req, {
        previous: _.cloneDeep(matchingRecord.toJSON())
      })
    }

    // Do a final query to populate the associations of the record.
    //
    // (Note: again, this extra query could be eliminated, but it is
    //  included by default to provide a better interface for integrating
    //  front-end developers.)
    let populatedRecord = await Model.findOne(updatedRecord[Model.primaryKey]).populateAll()
    if (!populatedRecord) return res.serverError('Could not find record after updating!')
    res.ok(populatedRecord)
  }catch(e){
    return res.negotiate(e)
  }
}
