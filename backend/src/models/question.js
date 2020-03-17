const mongoose = require('mongoose')

const Question = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  votes: {
    type: Number,
    default: 0
  },
  user: {
    // type: 'ObjectId',
    // ref: 'User'
    type: String,
    default: 'Anonymous'
  },
  is_highlighted: Boolean
}, { timestamps: true })

module.exports = Question
