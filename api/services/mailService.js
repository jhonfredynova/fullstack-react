let fs = require('fs'),
sendgrid = require('sendgrid')(process.env.SENDGRID_API_KEY),
sendgridHelper = require('sendgrid').mail

module.exports = {

  sendEmail: async (data) => {
    try{
      let messageMail = fs.readFileSync('./api/templates/mail.html').toString()
      messageMail = messageMail.replace(new RegExp('{{appLogo}}', 'g'), sails.config.app.appLogo)
      messageMail = messageMail.replace(new RegExp('{{appName}}', 'g'), sails.config.app.appName)
      messageMail = messageMail.replace(new RegExp('{{appUrl}}', 'g'), sails.config.app.appUrl)
      messageMail = messageMail.replace(new RegExp('{{mailFrom}}', 'g'), sails.config.app.fromEmail)
      //mail-body
      messageMail = messageMail.replace(new RegExp('{{title}}', 'g'), data.subject)
      messageMail = messageMail.replace(new RegExp('{{message}}', 'g'), data.message)
      //send-mail
      let fromEmail = new sendgridHelper.Email(data.fromEmail)
      let toEmail = new sendgridHelper.Email(data.toEmail)
      let subject = data.subject
      let content = new sendgridHelper.Content('text/html', messageMail)
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