const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
const autopopulate = require('mongoose-autopopulate')

const User = new mongoose.Schema(
  {
    name: String,
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

User.plugin(autopopulate)

module.exports = mongoose.model('User', User)
