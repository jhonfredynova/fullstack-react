#!/usr/bin/env node
require('dotenv').config()

var _ = require('lodash'),
    axios = require('axios'),
    config = require('../config/config')

async function processSubscriptionControl() {
  try{
    var responseUser = await axios.post(`${process.env.LOCAL_API_URL}/usuario/ingresar`, { email: process.env.LOCAL_API_USERNAME, password: process.env.LOCAL_API_PASSWORD })
    var requestHeaders = { headers: { 'Authorization': responseUser.data.token } }
    var responseSubscriptions = await axios.post(`${process.env.LOCAL_API_URL}/usuario/controlSubscriptions`, null, requestHeaders)
    var usersCancelSubscription = _.filter(responseSubscriptions.data, function(user){ return user.process==='CANCEL_SUBSCRIPTION' })
    var usersChangeSubscription = _.filter(responseSubscriptions.data, function(user){ return user.process==='CHANGE_SUBSCRIPTION' })
    //CANCEL-SUBSCRIPTIONS
    for (let user of usersCancelSubscription)
    {
      if (user.planDetails.idSubscription) {
        await axios.delete(`${process.env.LOCAL_API_URL}/payu/subscription/${user.planDetails.idSubscription}/${user.payuClientCode}`, requestHeaders)
      }
      await axios.put(`${process.env.LOCAL_API_URL}/usuario/${user._id}`, user, requestHeaders)
      await axios.get(`${process.env.LOCAL_API_URL}/plan/${user.planDetails.plan}`, requestHeaders)
      axios.post(`${process.env.LOCAL_API_URL}/common/send-message`, { fromName: 'Venpad', fromEmail: config.app.emails.system, toEmail: user.email, subject: 'SE HA CANCELADO TU SUSCRIPCIÓN', message: 'Se canceló tu suscripción, ahora has regresado al <b>PLAN GRATUITO</b>.' })
    }
    //CHANGE-SUBSCRIPTIONS
    var newPlanDetails = null
    var msgResponseChangeSubscription = ''
    for (let user of usersChangeSubscription)
    {
      if (user.planDetails.idSubscription) {
        await axios.delete(`${process.env.LOCAL_API_URL}/payu/subscription/${user.planDetails.idSubscription}/${user.payuClientCode}`, requestHeaders)
      }
      if (user.planDetails.payuPlanCode && user.planDetails.payuPlanCode!=='') {
        var dataNewSubscription = {
          plan: { payuPlanCode: user.planDetails.payuPlanCode, quantity: user.planDetails.quantity, trialDays: user.planDetails.trialDays },
          client: { _id: user._id, email: user.email, payuClientCode: user.payuClientCode, planDetails: { plan: user.planDetails.plan } },
          creditCard: { token: user.planDetails.customerPayu.creditCards[0].token }
        }
        try{
          await axios.post(`${process.env.LOCAL_API_URL}/payu/subscription`, dataNewSubscription, requestHeaders)
          newPlanDetails = await axios.get(`${process.env.LOCAL_API_URL}/plan/${user.planDetails.plan}`, requestHeaders)
          msgResponseChangeSubscription = `Se actualizó tu suscripción correctamente al <b>${newPlanDetails.data.data.name}</b>.`
        }catch(e){
          user.planDetails.plan = config.app.data.catalogs.planFree
          msgResponseChangeSubscription = 'Se canceló tu suscripción, ahora has regresado al <b>PLAN GRATUITO</b>. Hubo problemas haciendo el cargo a tu tarjeta de crédito, comunícate con tu banco para obtener más información.'
        }
      }
      await axios.put(`${process.env.LOCAL_API_URL}/usuario/${user._id}`, user, requestHeaders)
      await axios.post(`${process.env.LOCAL_API_URL}/common/send-message`, { fromName: 'Venpad', fromEmail: config.app.emails.system, toEmail: user.email, subject: 'SE HA ACTUALIZADO TU SUSCRIPCIÓN', message: msgResponseChangeSubscription })
    }
    //NOTIFICATION
    if (responseSubscriptions.data && responseSubscriptions.data.length>0) {
      await axios.post(`${process.env.LOCAL_API_URL}/common/send-message`, { fromName: 'Venpad', fromEmail: config.app.emails.system, toEmail: 'support@venpad.com', subject: 'Worker CheckSubscriptions Exitoso', message: `Se ejecutó proceso correctamente, se procesó ${usersCancelSubscription.length} cancelaciones y ${usersChangeSubscription.length} cambios de plan.` })
    }
  }catch(e){
    console.error(e)
    await axios.post(`${process.env.LOCAL_API_URL}/common/send-message`, { fromName: 'Venpad', fromEmail: config.app.emails.system, toEmail: 'support@venpad.com', subject: 'Worker CheckSubscriptions Falló', message: `Ocurrio un error al ejecutar el proceso: ${e}` })
  }
}

processSubscriptionControl()