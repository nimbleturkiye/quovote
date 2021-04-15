const mongoose = require('mongoose')
const Question = require('./question')
const { customAlphabet } = require('nanoid')
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6)

const Event = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 80,
    },
    questions: [Question],
    code: {
      type: String,
      unique: true,
      minlength: 3,
      maxlength: 8,
    },
    description: {
      type: String,
      maxlength: 280,
    },
    owner: {
      type: 'ObjectId',
      ref: 'User'
    },
    participants: [
      {
        type: 'ObjectId',
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
    },
  }
)

Event.pre('save', async function (next) {
  this.questions.sort((a, b) => b.votes - a.votes)

  if (this.code) return next()

  this.code = await this.constructor.generateRandomCode()

  next()
})

Event.static('decorateForUser', function (event, userIds) {
  const updatedQuestions = event.questions.toObject().map(q => {
    return {
      ...q,
      voted: q.voters.some(v => userIds.some(id => id.equals(v))),
      ownQuestion: userIds.some(i => i.equals(q.user)),
      user: undefined,
      voters: undefined,
    }
  })

  return { ...event.toObject(), questions: updatedQuestions }
})

Event.static('generateRandomCode', async function () {
  let code

  do {
    code = nanoid()
  } while (await this.exists({ code }))

  return code
})

module.exports = mongoose.model('Event', Event)
