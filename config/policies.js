/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

let authorization = (requiredLevels, mustHaveAll) => {
  return (req, res, next) => {
    if(!_.includes(requiredLevels, req.user.permissions, mustHaveAll)){
      return res.forbidden()
    }
    next()
  }
}

module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  '*': false,
  AppController: {
    getIndex: true,
    getConfig: true,
    getContact: true
  },
  AuthController: {
    me: ['isAuthenticated'],
    login: true,
    register: true,
    provider: true,
    providerAction: true,
    providerCallback: true
  },
  CatalogController: {
    find: true,
    create: ['isAuthenticated', authorization([1], true)],
    update: ['isAuthenticated', authorization([1], true)],
    destroy: ['isAuthenticated', authorization([1], true)]
  },
  LocaleController: {
    find: true,
    create: ['isAuthenticated', authorization([1], true)],
    update: ['isAuthenticated', authorization([1], true)],
    destroy: ['isAuthenticated', authorization([1], true)]
  },
  PaymentController: {
    controlSubscriptions: ['isAuthenticated', authorization([1], true)],
    getBilling: ['isAuthenticated', authorization([1,2,3,4], false)],
    getSubscription: ['isAuthenticated', authorization([1,2,3,4], false)],
    getSubscriptionPlan: ['isAuthenticated', authorization([1,2,3,4], false)],
    getTransaction: true,
    createSubscription: true,
    createTransaction: true,
    updateCreditCard: ['isAuthenticated', authorization([1,2,3,4], false)],
    updateSubscription: ['isAuthenticated', authorization([1,2,3,4], false)],
    deleteSubscription: ['isAuthenticated', authorization([1,2,3,4], false)]
  },
  PlanController: {
    find: true,
    create: ['isAuthenticated', authorization([1], true)],
    update: ['isAuthenticated', authorization([1], true)],
    destroy: ['isAuthenticated', authorization([1], true)]
  },
  PlanFeatureController: {
    find: true,
    create: ['isAuthenticated', authorization([1], true)],
    update: ['isAuthenticated', authorization([1], true)],
    destroy: ['isAuthenticated', authorization([1], true)]
  },
  RolController: {
    find: true,
    create: ['isAuthenticated', authorization([1], true)],
    update: ['isAuthenticated', authorization([1], true)],
    destroy: ['isAuthenticated', authorization([1], true)]
  },
  UserController: {
    find: ['isAuthenticated', authorization([1,2,3,4], false)],
    create: ['isAuthenticated', authorization([1], true)],
    update: ['isAuthenticated', authorization([1,2,3,4], false)],
    destroy: ['isAuthenticated', authorization([1], true)],
    populate: ['isAuthenticated', authorization([1], true)],
    add: ['isAuthenticated', authorization([1], true)],
    replace: ['isAuthenticated', authorization([1], true)],
    remove: ['isAuthenticated', authorization([1], true)],
    forgot: true,
    reset: true,
    validate: true
  },
};
