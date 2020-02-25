const mongoose = require('mongoose')

const User = new mongoose.Schema({
  name: String,
  events: [{
    type: 'ObjectId',
    ref: 'Event'
  }]
})

module.exports = mongoose.model('User', User)
