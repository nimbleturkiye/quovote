const express = require('express')
const router = express.Router()
const Event = require('../models/event')
const Singularity = require('../models/singularity')
const socketServer = require('../socket-connection')
const ensureSingularity = require('../lib/ensureSingularity')
const ObjectId = require('mongoose').Types.ObjectId
const { v4: uuid } = require('uuid')
const { celebrate, Joi, Segments } = require('celebrate')

async function ensureUser(req, res, next) {
  if (req.body.computerId) req.session.computerId = req.body.computerId
  else {
    req.session.computerId = req.session.computerId || `nobiri-${uuid()}`
  }

  if (!req.session.userId) {
    if (req.user) req.session.userId = req.user._id
    else {
      req.session.userId = ObjectId()

      await req.session.save()
    }
  }

  await ensureSingularity({
    userId: req.session.userId,
    sessionId: req.session.id,
    computerId: req.session.computerId,
  })

  next()
}

async function fetchUserIdsBySingularities({ sessionId, userId, computerId }) {
  return Singularity.find({
    $or: [{ sessionId }, { userId }, { computerId }],
  })
    .select('-_id userId')
    .distinct('userId')
}

router.param('eventId', async function ensureEvent(req, res, next) {
  if (!ObjectId.isValid(req.params.eventId)) return next(new Error('Event not found'))

  const event = await Event.findById(req.params.eventId)

  if (!event) return next(new Error('Event not found'))

  req.event = event

  next()
})

router.post('/singularity', ensureUser, async (req, res, next) => {
  res.sendStatus(200)
})

function ensureLogin(req, res, next) {
  if (req.user) return next()

  next(new Error('Unauthorized'))
}

router.get('/events', ensureUser, async (req, res, next) => {
  let query = { code: new RegExp(`^${req.query.code}$`, 'i') }

  if (ObjectId.isValid(req.query.code)) {
    query = { _id: req.query.code }
  }

  const event = await Event.findOne(query)

  if (!event) return res.send(null)

  res.send(event._id)
})

const eventsValidator = celebrate(
  {
    [Segments.BODY]: Joi.object().keys({
      title: Joi.string()
        .required()
        .min(3)
        .max(80)
        .trim()
        .replace(/(\s)\1*/g, '$1')
        .label('Title'),
      code: Joi.string()
        .trim()
        .min(3)
        .max(8)
        .replace(/(\s+)/g, '$1')
        .label('Code')
        .pattern(/^[a-z0-9]+$/),
      description: Joi.string().trim().max(280).replace(/(\s+)/g, '$1').label('Description'),
    }),
  },
  {
    messages: {
      'string.pattern.base': 'Event code can only include lowercase letters and numbers.',
    },
  }
)

router.post('/events', ensureUser, ensureLogin, eventsValidator, async function (req, res, next) {
  const eventRequest = {
    title: req.body.title,
    code: req.body.code,
    description: req.body.description,
    owner: req.user._id
  }

  const event = await Event.create(eventRequest)

  req.user.events.push(event)
  await req.user.save()

  res.send(event)
})

router.get('/events/:eventId', ensureUser, async (req, res, next) => {
  const { id: sessionId, userId, computerId } = req.session
  const userIds = await fetchUserIdsBySingularities({ sessionId, userId, computerId })

  res.send(Event.decorateForUser(req.event, userIds))
})

const questionsValidator = celebrate({
  [Segments.BODY]: Joi.object().keys({
    text: Joi.string()
      .required()
      .min(5)
      .max(280)
      .trim()
      .replace(/(\s)\1*/g, '$1')
      .label('Question'),
    user: Joi.string().trim().replace(/(\s+)/g, '$1'),
  }),
})

router.post('/events/:eventId/questions', ensureUser, questionsValidator, async function (req, res, next) {
  const { userId } = req.session

  req.event.questions.unshift({ text: req.body.text, author: req.body.user, user: userId })

  await req.event.save()

  socketServer().to(req.params.eventId).emit('questions updated')

  res.send(true)
})

router.delete('/events/:eventId/questions/:questionId', async function (req, res, next) {
  const { id: sessionId, userId, computerId } = req.session
  const userIds = await fetchUserIdsBySingularities({ sessionId, userId, computerId })

  const question = req.event.questions.find(
    q => userIds.some(i => i.equals(q.user)) && q._id.equals(req.params.questionId)
  )

  if (!question) return res.sendStatus(404)

  question.remove()
  await req.event.save()

  socketServer().to(req.params.eventId).emit('questions updated')

  res.sendStatus(200)
})

router.patch('/events/:eventId/questions/:questionId', ensureUser, async function (req, res, next) {
  const { id: sessionId, userId, computerId } = req.session
  const { questionId } = req.params
  const { action } = req.body

  if (action == 'like' && !req.user && computerId.startsWith('nobiri-')) return res.sendStatus(401)

  const userIds = await fetchUserIdsBySingularities({ sessionId, userId, computerId })

  let arrayFilters = [{ 'question._id': questionId }]

  let update

  switch (action) {
    case 'like':
      arrayFilters = [{ 'question._id': questionId, 'question.voters': { $nin: userIds } }]
      update = {
        $addToSet: {
          'questions.$[question].voters': userId,
        },
      }
      break

    case 'dislike':
      arrayFilters = [{ 'question._id': questionId, 'question.voters': { $in: userIds } }]
      update = {
        $pullAll: {
          'questions.$[question].voters': userIds,
        },
      }
      break

    case 'pin':
    case 'unpin':
      update = {
        $set: {
          'questions.$[question].isPinned': action == 'pin',
        },
      }
      break
  }

  const event = await Event.findOneAndUpdate(
    {
      _id: req.params.eventId,
    },
    update,
    {
      new: true,
      arrayFilters,
    }
  )

  if (!event) return next(new Error('Event or question not found'))

  socketServer().to(req.params.eventId).emit('questions updated')

  res.sendStatus(200)
})

module.exports = router
