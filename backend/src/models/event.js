const mongoose = require('mongoose')
const Question = require('./question')
const { customAlphabet } =  require('nanoid')
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6)

const Event = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 80
    },
    questions: [Question],
    code: {
      type: String,
      unique: true,
      maxlength: 20
    },
    description: {
      type: String,
      maxlength: 280
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

  let code

  do {
    code = nanoid()
  } while (await this.constructor.findOne({ code }))

  this.code = code

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

module.exports = mongoose.model('Event', Event)
