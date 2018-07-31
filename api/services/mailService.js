let sendgrid = require('sendgrid')(process.env.SENDGRID_API_KEY),
sendgridHelper = require('sendgrid').mail

module.exports = {

  sendEmail: async (data) => {
    try{
      let fromEmail = new sendgridHelper.Email(data.fromEmail)
      let toEmail = new sendgridHelper.Email(data.toEmail)
      let subject = data.subject
      let content = new sendgridHelper.Content('text/html', intlService.i18n('mail', {
        appLogo: sails.config.app.appLogo,
        appName: sails.config.app.appName,
        appUrl: sails.config.app.appUrl,
        mailFrom: sails.config.app.emails.noreply,
        title: data.subject,
        message: data.message
      }))
      let mail = new sendgridHelper.Mail(fromEmail, subject, toEmail, content)
      mail.from_email.name = data.fromName
      let request = sendgrid.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON(),
      })
      return await sendgrid.API(request)
    }catch(e){
      throw e
    }
  }

}