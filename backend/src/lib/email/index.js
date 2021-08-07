const nodemailer = require('nodemailer')
const pug = require('pug')
const { htmlToText } = require('html-to-text')
const path = require('path')

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
})

async function send(payload) {
  try {
    await transport.sendMail({ text: htmlToText(payload.html), ...payload })
  } catch (err) {
    console.log(err)
    throw new Error('There is a problem sending email. Please try again later.')
  }
}

async function sendEmailVerification(email, name, token) {
  if (!name || !token) throw new Error('Name and token must be provided.')

  const verificationUrl = `${process.env.BACKEND_BASE_PATH}/account/email-verification?token=${token}`

  await send({
    from: '"QuoVote" <hello@quo.vote>',
    to: email,
    subject: 'Verify your QuoVote account',
    html: pug.renderFile(path.join(__dirname, '/templates/verify-email.pug'), {
      name,
      verificationUrl
    })
  })
}

module.exports = { sendEmailVerification }
