/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.policies.html
 */


let authorization = (requiredLevels, mustHaveAll) => {
  return (req, res, next) => {
    if(!Object.includes(requiredLevels, req.user.permissions, mustHaveAll)){
      return res.forbidden(intlService.__('authNotPriviliges')) 
    }
    next()
  }
}

module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions (`true` allows public     *
  * access)                                                                  *
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
    delete: ['isAuthenticated', authorization([1], true)]
  },
  LocaleController: {
    find: true,
    create: ['isAuthenticated', authorization([1], true)],
    update: ['isAuthenticated', authorization([1], true)],
    delete: ['isAuthenticated', authorization([1], true)]
  },
  PaymentController: {
    controlSubscriptions: ['isAuthenticated', authorization([1], true)],
    getBilling: ['isAuthenticated', authorization([1,2,3,4], false)],
    getSubscription: ['isAuthenticated', authorization([1,2,3,4], false)],
    getSubscriptionPlan: ['isAuthenticated', authorization([1,2,3,4], false)],
    createSubscription: ['isAuthenticated', authorization([1,2,3,4], false)],
    updateCreditCard: ['isAuthenticated', authorization([1,2,3,4], false)],
    updateSubscription: ['isAuthenticated', authorization([1,2,3,4], false)],
    deleteSubscription: ['isAuthenticated', authorization([1,2,3,4], false)]
  },
  PlanController: {
    find: true,
    create: ['isAuthenticated', authorization([1], true)],
    update: ['isAuthenticated', authorization([1], true)],
    delete: ['isAuthenticated', authorization([1], true)]
  },
  PlanFeatureController: {
    find: true,
    create: ['isAuthenticated', authorization([1], true)],
    update: ['isAuthenticated', authorization([1], true)],
    delete: ['isAuthenticated', authorization([1], true)]
  },
  RolController: {
    find: true,
    create: ['isAuthenticated', authorization([1], true)],
    update: ['isAuthenticated', authorization([1], true)],
    delete: ['isAuthenticated', authorization([1], true)]
  },
  UserController: {
    find: ['isAuthenticated', authorization([1], true)],
    create: ['isAuthenticated', authorization([1], true)],
    update: ['isAuthenticated', authorization([1,2,3,4], false)],
    delete: ['isAuthenticated', authorization([1], true)],
    forgot: true,
    reset: true,
    validate: true
  },
  UserPlanController: {
    find: ['isAuthenticated', authorization([1], true)],
    create: ['isAuthenticated', authorization([1], true)],
    update: ['isAuthenticated', authorization([1], true)],
    delete: ['isAuthenticated', authorization([1], true)]
  },

  /***************************************************************************
  *                                                                          *
  * Here's an example of mapping some policies to run before a controller    *
  * and its actions                                                          *
  *                                                                          *
  ***************************************************************************/
	// RabbitController: {

		// Apply the `false` policy as the default for all of RabbitController's actions
		// (`false` prevents all access, which ensures that nothing bad happens to our rabbits)
		// '*': false,

		// For the action `nurture`, apply the 'isRabbitMother' policy
		// (this overrides `false` above)
		// nurture	: 'isRabbitMother',

		// Apply the `isNiceToAnimals` AND `hasRabbitFood` policies
		// before letting any users feed our rabbits
		// feed : ['isNiceToAnimals', 'hasRabbitFood']
	// }
};
