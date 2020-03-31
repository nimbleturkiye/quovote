const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const Question = require('../models/question');
const socketServer = require('../socket-connection');

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/events', async function(req, res, next) {
  const event = new Event({title: 'test event'})
  await event.save()

  res.send(event)
})

router.get('/events/:eventId/questions', async (req, res, next) => {
  const event = await Event.findOne({ _id: req.params.eventId })

  if (!event) return next(new Error('Event not found'))

  const { questions } = Event.decorateForUser(event, req.session.id)

  res.send(questions)
})

router.post('/events/:eventId/questions', async function(req, res, next) {
  if (!req.body.text) return next(new Error('Question cannot be left blank'))

  const event = await Event.findOne({ _id: req.params.eventId })

  if (!event) return next(new Error('Event not found'))

  event.questions.unshift({ text: req.body.text, user: req.body.user })

  try {
    await event.save()

    const { questions } = Event.decorateForUser(event, req.session.id)

    socketServer().to(req.params.eventId).emit('questions updated', questions)

    res.send(event)
  } catch(e) {
    next(e)
  }
})

router.patch('/events/:eventId/questions/:questionId', async function(req, res, next) {
  const update = {}

  const predicate = {
    'questions.$.voters': req.session.id
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

  const { questions } = Event.decorateForUser(event, req.session.id)

  socketServer().to(req.params.eventId).emit('questions updated', questions)

  res.sendStatus(200)
})

module.exports = router;
