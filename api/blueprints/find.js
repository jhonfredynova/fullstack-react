/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
var formatUsageError = require('sails/lib/hooks/blueprints/formatUsageError');

/**
 * Find Records
 *
 * http://sailsjs.com/docs/reference/blueprint-api/find
 *
 * An API call to find and return model instances from the data adapter
 * using the specified criteria.  If an id was specified, just the instance
 * with that unique id will be returned.
 *
 */

module.exports = function findRecords (req, res) {

  var parseBlueprintOptions = req.options.parseBlueprintOptions || req._sails.config.blueprints.parseBlueprintOptions;

  // Set the blueprint action for parseBlueprintOptions.
  req.options.blueprintAction = 'find';

  var queryOptions = parseBlueprintOptions(req);
  var Model = req._sails.models[queryOptions.using];

  Model
  .find(_.cloneDeep(queryOptions.criteria), queryOptions.populates).meta(queryOptions.meta)
  .exec(function found(err, matchingRecords) {
    if (err) {
      // If this is a usage error coming back from Waterline,
      // (e.g. a bad criteria), then respond w/ a 400 status code.
      // Otherwise, it's something unexpected, so use 500.
      switch (err.name) {
        case 'UsageError': return res.badRequest(formatUsageError(err, req));
        default: return res.serverError(err);
      }
    }//-•

    if (req._sails.hooks.pubsub && req.isSocket) {
      Model.subscribe(req, _.pluck(matchingRecords, Model.primaryKey));
      // Only `._watch()` for new instances of the model if
      // `autoWatch` is enabled.
      if (req.options.autoWatch) { Model._watch(req); }
      // Also subscribe to instances of all associated models
      _.each(matchingRecords, function (record) {
        actionUtil.subscribeDeep(req, record);
      });
    }//>-

    /*****************************************************
    // START PATCH
    ******************************************************/
    Model.count(_.pick(queryOptions.criteria, ['where'])).meta(queryOptions.meta)
    .exec(function found(err, totalRecords) {
      if(err){
        sails.log.verbose('In `populate` blueprint action: an error ocurred consulting the total of records.')
        return res.notFound()
      }
      matchingRecords = requestService.applyPagination(res, queryOptions.criteria, matchingRecords, totalRecords)
      let afterFindCallback = sails.models[Model.tableName].afterFind || ((values, next) => next())
      afterFindCallback(matchingRecords, function(values){
        return res.ok(matchingRecords)
      })
    })
    /*****************************************************
    // END PATCH
    ******************************************************/
    // return res.ok(matchingRecords);

  });//</ .find().exec() >

};

