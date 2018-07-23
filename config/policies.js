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
    create: ['isAuthenticated','isLevel1'],
    update: ['isAuthenticated','isLevel1'],
    delete: ['isAuthenticated','isLevel1']
  },
  LocaleController: {
    find: true,
    create: ['isAuthenticated','isLevel1'],
    update: ['isAuthenticated','isLevel1'],
    delete: ['isAuthenticated','isLevel1']
  },
  PaymentController: {
    controlSubscriptions: ['isAuthenticated',],
    getBilling: ['isAuthenticated'],
    getSubscription: ['isAuthenticated'],
    getSubscriptionPlan: ['isAuthenticated'],
    createSubscription: ['isAuthenticated'],
    updateCreditCard: ['isAuthenticated'],
    updateSubscription: ['isAuthenticated'],
    deleteSubscription: ['isAuthenticated']
  },
  PlanController: {
    find: true,
    create: ['isAuthenticated','isLevel1'],
    update: ['isAuthenticated','isLevel1'],
    delete: ['isAuthenticated','isLevel1']
  },
  PlanFeatureController: {
    find: true,
    create: ['isAuthenticated','isLevel1'],
    update: ['isAuthenticated','isLevel1'],
    delete: ['isAuthenticated','isLevel1']
  },
  RolController: {
    find: true,
    create: ['isAuthenticated','isLevel1'],
    update: ['isAuthenticated','isLevel1'],
    delete: ['isAuthenticated','isLevel1']
  },
  UserController: {
    find: ['isAuthenticated','isLevel1'],
    create: ['isAuthenticated','isLevel1'],
    update: ['isAuthenticated','isLevel1'],
    delete: ['isAuthenticated','isLevel1'],
    forgot: true,
    reset: true,
    validate: true
  },
  UserPlanController: {
    find: ['isAuthenticated','isLevel1'],
    create: ['isAuthenticated','isLevel1'],
    update: ['isAuthenticated','isLevel1'],
    delete: ['isAuthenticated','isLevel1']
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
