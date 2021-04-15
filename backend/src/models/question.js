const mongoose = require('mongoose')

const Question = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 280
    },
    voters: {
      type: ['ObjectId'],
      default: [],
    },
    user: {
      type: 'ObjectId',
      ref: 'User',
    },
    author: {
      type: String,
      default: 'Anonymous',
      maxlength: 40
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
      transform(doc, ret, options) {
        delete ret.voters
        delete ret.user
        return ret
      },
    },
  }
)

Question.virtual('votes').get(function () {
  return this.voters.length
})

module.exports = Question
