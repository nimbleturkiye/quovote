const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
const autopopulate = require('mongoose-autopopulate')
const emailVerification = require('../lib/emailVerificationPlugin')

const User = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 64,
    },
    sessionId: String,
    computerId: String,
    director: {
      language: {
        type: String,
        default: 'en-US',
      },
      triggers: {
        type: Array,
        default: [],
      }
    },
    events: [
      {
        type: 'ObjectId',
        ref: 'Event',
        autopopulate: true,
      },
    ],
  },
  { timestamps: true }
)

User.plugin(passportLocalMongoose, {
  usernameField: 'email',
  populateFields: ['name, sessionId'],
})

User.plugin(emailVerification)

User.plugin(autopopulate)
module.exports = mongoose.model('User', User)
