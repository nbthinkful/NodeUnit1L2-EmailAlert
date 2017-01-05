'use strict';

const nodemailer = require('nodemailer');
const {logger} = require('./utilities/logger');

const sendEmail = (emailData) => {

  let connection= {
    host:process.env.SMTP_HOST,
    port:parseInt(process.env.SMTP_PORT,10),
    secure: Boolean(process.env.SMTP_SECURE),
    auth: {
      user:process.env.SMTP_USER,
      pass:process.env.SMTP_PASSWORD
    },
    logger:Boolean(process.env.SMTP_LOGGING)
  };

  const transporter = nodemailer.createTransport(connection);
  logger.info(`Attempting to send email from ${emailData.from}`);
  
  transporter.sendMail(emailData)
    .then(info => {
      console.log(`Message sent: ${info.response}`)
    })
    .catch(err => console.log(`Problem sending email: ${err}`));
}


module.exports = {sendEmail};
