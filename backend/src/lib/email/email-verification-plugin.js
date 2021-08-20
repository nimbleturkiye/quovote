const mongoose = require('mongoose')
const nanoid = require('nanoid').customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyz',
  40
)
const { sendEmailVerification } = require('./index')

const EmailToken = mongoose.model(
  'EmailToken',
  {
    token: {
      type: String,
      unique: true,
      required: true,
      default: nanoid
    },
    user: {
      type: mongoose.Types.ObjectId,
      required: true
    },
    createdAt: { type: Date, default: Date.now, expires: '15m' }
  },
  'email-tokens'
)

module.exports = function (schema) {
  schema.add({
    isVerified: {
      type: Boolean,
      default: false
    }
  })

  schema.methods.sendVerificationEmail = async function () {
    await EmailToken.deleteMany({ user: this })

    const { token } = await EmailToken.create({ user: this })

    await sendEmailVerification(this.email, this.name, token)
  }

  schema.statics.verifyEmailByToken = async function (token) {
    const emailToken = await EmailToken.findOneAndRemove({ token })

    if (!emailToken) throw new Error('Token is invalid')

    await this.findByIdAndUpdate(emailToken.user, { isVerified: true })
  }

  schema.index({ email: 1, isVerified: 1 })
}
