const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const User = new mongoose.Schema({
  name: String,
  sessionId: String,
  computerId: String,
  events: [
    {
      type: 'ObjectId',
      ref: 'Event',
    },
  ],
})

User.plugin(passportLocalMongoose, {
  usernameField: 'email',
  populateFields: ['name, sessionId'],
})

module.exports = mongoose.model('User', User)
