/**
 * Default model configuration
 * (sails.config.models)
 *
 * Unless you override them, the following properties will be included
 * in each of your models.
 *
 * For more info on Sails models, see:
 * http://sailsjs.org/#!/documentation/concepts/ORM
 */

 module.exports.models = {

  /***************************************************************************
  *                                                                          *
  * Your app's default connection. i.e. the name of one of your app's        *
  * connections (see `config/connections.js`)                                *
  *                                                                          *
  ***************************************************************************/
  //connection: 'someMongodbServer',

  /***************************************************************************
  *                                                                          *
  * How and whether Sails will attempt to automatically rebuild the          *
  * tables/collections/etc. in your schema.                                  *
  *                                                                          *
  * See http://sailsjs.org/#!/documentation/concepts/ORM/model-settings.html  *
  *                                                                          *
  ***************************************************************************/
  migrate: 'safe',

  /***************************************************************************
  *                                                                          *
  * Force model scheme                                                       *
  *                                                                          *
  ***************************************************************************/
  schema: true,

  /***************************************************************************
  *                                                                          *
  * Model validations                                                        *
  *                                                                          *
  ***************************************************************************/
  types: {
    deduction: function(value){
      if (!value) return
      value = _.pick(value, ['name','percent'])
      return (value.name && value.percent)
    },
    duration: function(value){
      if (!value) return
      value = _.pick(value, ['startDate','endDate'])
      return (value.startDate && value.endDate) && (value.endDate>value.startDate)
    },
    location: function(value){
      if (!value) return
      value = _.pick(value, ['latitude','longitude'])
      return value.latitude && value.longitude
    },
    password: function(value) {
      if (!value) return
      return value===this.passwordConfirmation
    },
    phone: function(value){
      if (!value) return
      value = _.pick(value, ['callingCode','number'])
      return value.callingCode && value.number
    },
    price: function(value){
      if (!value) return
      value = _.pick(value, ['currency','value'])
      return value.currency && value.value
    }
  }
    
}
