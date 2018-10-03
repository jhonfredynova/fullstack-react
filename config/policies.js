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
    me: ['session'],
    login: true,
    logout: true,
    register: true,
    provider: true,
    providerAction: true,
    providerCallback: true
  },
  CatalogController: {
    find: true,
    create: ['session', authorization([1], true)],
    update: ['session', authorization([1], true)],
    destroy: ['session', authorization([1], true)]
  },
  ChatController: {
    find: ['session', authorization([1,2,3,4], false)],
    create: ['session', authorization([1,2,3,4], false)],
    update: ['session', authorization([1,2,3,4], false)],
    destroy: ['session', authorization([1,2,3,4], false)]
  },
  ChatMessageController: {
    find: ['session', authorization([1,2,3,4], false)],
    create: ['session', authorization([1,2,3,4], false)],
    update: ['session', authorization([1,2,3,4], false)],
    destroy: ['session', authorization([1,2,3,4], false)]
  },
  LocaleController: {
    find: true,
    create: ['session', authorization([1], true)],
    update: ['session', authorization([1], true)],
    destroy: ['session', authorization([1], true)]
  },
  PaymentController: {
    getBilling: ['session', authorization([1,2,3,4], false)],
    getSubscription: ['session', authorization([1,2,3,4], false)],
    getSubscriptionPlan: ['session', authorization([1,2,3,4], false)],
    getTransaction: true,
    createSubscription: true,
    createTransaction: true,
    updateCreditCard: ['session', authorization([1,2,3,4], false)],
    updateSubscription: ['session', authorization([1,2,3,4], false)],
    deleteSubscription: ['session', authorization([1,2,3,4], false)]
  },
  PlanController: {
    find: true,
    create: ['session', authorization([1], true)],
    update: ['session', authorization([1], true)],
    destroy: ['session', authorization([1], true)]
  },
  PlanFeatureController: {
    find: true,
    create: ['session', authorization([1], true)],
    update: ['session', authorization([1], true)],
    destroy: ['session', authorization([1], true)]
  },
  RolController: {
    find: true,
    create: ['session', authorization([1], true)],
    update: ['session', authorization([1], true)],
    destroy: ['session', authorization([1], true)]
  },
  SocketController: {
    connect: true,
    subscribe: true
  },
  UserController: {
    find: true,
    create: ['session', authorization([1], true)],
    update: ['session', authorization([1,2,3,4], false)],
    destroy: ['session', authorization([1], true)],
    populate: ['session', authorization([1], true)],
    add: ['session', authorization([1], true)],
    replace: ['session', authorization([1], true)],
    remove: ['session', authorization([1], true)],
    forgot: true,
    reset: true,
    validate: true
  },
};
