/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');


/**
 * 500 (Server Error) Handler
 *
 * Usage:
 * return res.serverError();
 * return res.serverError(data);
 *
 * e.g.:
 * ```
 * return res.serverError(
 *   'Please choose a valid `password` (6-12 characters)',
 *   'trial/signup'
 * );
 * ```
 */

module.exports = function badRequest(data) {

  // Get access to `req` and `res`
  var req = this.req;
  var res = this.res;

  // Get access to `sails`
  var sails = req._sails;

  // Log error to console
  if (!_.isUndefined(data)) {
    sails.log.verbose('Sending 500 ("Server Error") response: \n', data);
  }

  // Set status code
  res.status(500);

  // If no data was provided, use res.sendStatus().
  if (_.isUndefined(data)) {
    return res.sendStatus(500);
  }

  if (_.isError(data)) {
    // If the data is an Error instance and it doesn't have a custom .toJSON(),
    // then util.inspect() it instead (otherwise res.json() will turn it into an empty dictionary).
    // > Note that we don't do this in production, since (depending on your Node.js version) inspecting
    // > the Error might reveal the `stack`.  And since `res.badRequest()` could certainly be used in
    // > production, we wouldn't want to inadvertently dump a stack trace.
    if (!_.isFunction(data.toJSON)) {
      if (process.env.NODE_ENV==='production') {
        data.stack = null
      }
      // No need to JSON stringify (this is already a string).
      return res.send(data);
    }
  }
  return res.json(data);

};