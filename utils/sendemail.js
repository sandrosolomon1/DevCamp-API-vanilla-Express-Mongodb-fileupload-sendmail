"use strict";
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
const sendemail = async (options) => {

  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_HOST_USER, // generated ethereal user
      pass: process.env.EMAIL_HOST_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = {
    from: `${process.env.EMAIL_FROM} <${process.env.NAME_FROM}>`, // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.text, // plain text body
  };

  await transporter.sendMail(info);

  console.log("Message sent: %s", info.messageId);
}

module.exports = sendemail;