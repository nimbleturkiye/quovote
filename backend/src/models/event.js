const mongoose = require('mongoose')
const Question = require('./question')
const shortid = require('shortid')

const Event = new mongoose.Schema({
  title: String,
  questions: [Question],
  code: {
    type: String,
    unique: true
  },
  participants: [
    {
      type: 'ObjectId',
      ref: 'User'
    }
  ]
})

Event.pre('save', async function (next) {
  if (this.code) return next()

  let code

  do {
    code = shortid.generate()
  } while(await this.constructor.findOne({code}))

  this.code = code

  next();
});

module.exports = mongoose.model('Event', Event)
