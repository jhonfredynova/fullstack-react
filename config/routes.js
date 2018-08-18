/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  //  ╦ ╦╔═╗╔╗ ╔═╗╔═╗╔═╗╔═╗╔═╗
  //  ║║║║╣ ╠╩╗╠═╝╠═╣║ ╦║╣ ╚═╗
  //  ╚╩╝╚═╝╚═╝╩  ╩ ╩╚═╝╚═╝╚═╝

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/
  'get /*': {
    action: 'getIndex',
    controller: 'AppController',
    skipAssets: true,
    skipRegex: /^\/api\/.*$/
  },

  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/


  //  ╔═╗╔═╗╦  ╔═╗╔╗╔╔╦╗╔═╗╔═╗╦╔╗╔╔╦╗╔═╗
  //  ╠═╣╠═╝║  ║╣ ║║║ ║║╠═╝║ ║║║║║ ║ ╚═╗
  //  ╩ ╩╩  ╩  ╚═╝╝╚╝═╩╝╩  ╚═╝╩╝╚╝ ╩ ╚═╝
  //APP
  'get    /api/app/config': 'AppController.getConfig',
  'post   /api/app/contact': 'AppController.getContact',
  //AUTHENTICATION
  'get    /api/auth/me': 'AuthController.me',
  'post   /api/auth/login': 'AuthController.login',
  'post   /api/auth/register': 'AuthController.register',
  'get    /api/auth/:provider': 'AuthController.provider',
  'get    /api/auth/:provider/callback': 'AuthController.providerCallback',
  //PAYMENT
  'get    /api/payment/subscription/control': 'PaymentController.controlSubscriptions',
  'get    /api/payment/subscription/billing': 'PaymentController.getBilling',
  'get    /api/payment/subscription/plan': 'PaymentController.getSubscriptionPlan',
  'post   /api/payment/subscription': 'PaymentController.createSubscription',
  'get    /api/payment/subscription/:subscriptionId': 'PaymentController.getSubscription',
  'put    /api/payment/subscription/:subscriptionId/:clientCode/:creditCardId': 'PaymentController.updateCreditCard',
  'put    /api/payment/subscription/:subscriptionId': 'PaymentController.updateSubscription',
  'delete /api/payment/subscription/:subscriptionId': 'PaymentController.deleteSubscription',
  //USER
  'post   /api/user/forgot': 'UserController.forgot',
  'post   /api/user/forgot': 'UserController.forgot',
  'post   /api/user/reset/:token': 'UserController.reset',
  'post   /api/user/validate/:token': 'UserController.validate'


  //  ╦ ╦╔═╗╔╗ ╦ ╦╔═╗╔═╗╦╔═╔═╗
  //  ║║║║╣ ╠╩╗╠═╣║ ║║ ║╠╩╗╚═╗
  //  ╚╩╝╚═╝╚═╝╩ ╩╚═╝╚═╝╩ ╩╚═╝


  //  ╔╦╗╦╔═╗╔═╗
  //  ║║║║╚═╗║
  //  ╩ ╩╩╚═╝╚═╝


};
