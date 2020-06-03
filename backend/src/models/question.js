const mongoose = require('mongoose')

const Question = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  voters: {
    type: [String],
    default: []
  },
  user: {
    type: String,
    required: true
  },
  // user: {
  //   type: 'ObjectId',
  //   ref: 'User'
  // },
  author: {
    type: String,
    default: 'Anonymous'
  },
  is_highlighted: Boolean
}, {
  timestamps: true,
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true,
    transform(doc,  ret, options) {
      delete ret.voters
      delete ret.user
      return ret
    }
  }
})

Question.virtual('votes').get(function() {
  return this.voters.length
})

module.exports = Question
