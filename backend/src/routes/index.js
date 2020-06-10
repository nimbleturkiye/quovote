const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const User = require('../models/user');
const Singularity = require('../models/singularity');
const socketServer = require('../socket-connection');
const ObjectId = require('mongoose').Types.ObjectId;

async function ensureSingularity(singularity) {
  try {
    await Singularity.create(singularity)
  } catch(e) {
    console.log('this user was previously seen', singularity)
  }
}

async function ensureUser(req, res, next) {
  if (!req.session.user)
    req.session.user = await User.findOneAndUpdate({ sessionId: req.session.id }, { sessionId: req.session.id, computerId: req.session.computerId }, { upsert: true, new: true })

  await ensureSingularity({ userId: req.session.user._id, sessionId: req.session.id, computerId: req.session.computerId })

  next()
}

router.post('/register', async (req, res, next) => {
  req.session.computerId = req.body.computerId
  req.session.user = await User.findOneAndUpdate({ sessionId: req.session.id }, { sessionId: req.session.id, computerId: req.session.computerId }, { upsert: true, new: true })

  await ensureSingularity({ userId: req.session.user._id, sessionId: req.session.id, computerId: req.session.computerId })

  req.session.save()
  res.sendStatus(200)
})

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/events', ensureUser, async (req, res, next) => {
  let query = { code: new RegExp(`^${req.query.code}$`, 'i') }

  if (ObjectId.isValid(req.query.code)) {
    query = { _id: req.query.code }
  }

  const event = await Event.findOne(query)

  if (!event) return res.send(null)

  res.send(event._id)
})

router.post('/events', async function(req, res, next) {
  const event = new Event({title: 'test event'})
  await event.save()

  res.send(event)
})

router.get('/events/:eventId', async (req, res, next) => {
  let event = await Event.findOne({ _id: req.params.eventId })

  if (!event) return next(new Error('Event not found'))

  event = Event.decorateForUser(event, req.session.user && req.session.computerId)

  res.send(event)
})

router.post('/events/:eventId/questions', ensureUser, async function(req, res, next) {
  if (!req.body.text) return next(new Error('Question cannot be left blank'))

  const event = await Event.findOne({ _id: req.params.eventId })

  if (!event) return next(new Error('Event not found'))

  event.questions.unshift({ text: req.body.text, author: req.body.user, user: req.session.computerId })

  try {
    await event.save()

    const { questions } = Event.decorateForUser(event, req.session.computerId)

    socketServer().to(req.params.eventId).emit('questions updated', questions)

    res.send(event)
  } catch(e) {
    next(e)
  }
})

router.delete('/events/:eventId/questions/:questionId', async function(req, res, next) {
  let event = await Event.findOne({ _id: req.params.eventId })

  if (!event) return next(new Error('Event not found'))

  const question = event.questions.find(q => q.user == req.session.computerId && q._id.equals(req.params.questionId))

  if (!question) return res.sendStatus(404)

  question.remove()
  await event.save()

  const { questions } = Event.decorateForUser(event, req.session.user && req.session.computerId)

  socketServer().to(req.params.eventId).emit('questions updated', questions)

  res.sendStatus(200)
})

router.patch('/events/:eventId/questions/:questionId', ensureUser, async function(req, res, next) {
  const singularities = await Singularity.find({
    $or: [
      { userId: req.session.user._id },
      { computerId: req.session.computerId },
      { sessionId: req.session._id }
    ]
  }).select('userId')

  const operator = req.body.vote == 'like' ? '$addToSet' : '$pull'

  const update = {
    [operator]: {
      'questions.$.voters': req.session.user._id
    }
  }

  const event = await Event.findOneAndUpdate({
    _id: req.params.eventId
  }, update, { new: true }).elemMatch('questions', {
    _id: req.params.questionId,
    voters: { $nin: singularities.map(s => s.userId) }
  })

  if (!event) return next(new Error('Event or question not found'))

  await event.save()

  const { questions } = Event.decorateForUser(event, req.session.computerId)

  socketServer().to(req.params.eventId).emit('questions updated', questions)

  res.sendStatus(200)
})

module.exports = router;
