const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const User = require('../models/user');
const socketServer = require('../socket-connection');
const ObjectId = require('mongoose').Types.ObjectId;

async function ensureUser(req, res, next) {
  if (!req.session.user)
    req.session.user = await User.findOneAndUpdate({ sessionId: req.session.id }, { sessionId: req.session.id, computerId: req.session.computerId }, { upsert: true, new: true })

  next()
}

router.post('/register', async (req, res, next) => {
  req.session.computerId = req.body.computerId
  req.session.user = await User.findOneAndUpdate({ sessionId: req.session.id }, { sessionId: req.session.id, computerId: req.session.computerId }, { upsert: true, new: true })

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
  const update = {}

  const predicate = {
    'questions.$.voters': req.session.computerId
  }

  if (req.body.vote == 'like') update.$addToSet = predicate
  else if (req.body.vote == 'dislike') update.$pull = predicate

  const event = await Event.findOneAndUpdate({
    _id: req.params.eventId
  }, update, { new: true }).elemMatch('questions', {
    _id: req.params.questionId
  })

  if (!event) return next(new Error('Event or question not found'))

  await event.save()

  const { questions } = Event.decorateForUser(event, req.session.computerId)

  socketServer().to(req.params.eventId).emit('questions updated', questions)

  res.sendStatus(200)
})

module.exports = router;
