const express = require('express')
const passport = require('passport')
const Validator = require('async-validator').default

const rateLimiter = require('../lib/rate-limiter');

const User = require('../models/user')

const ensureSingularity = require('../lib/ensureSingularity')

const router = express.Router()

router.get('/',
  rateLimiter({ points: 50, duration: 10 * 60 }),
  async (req, res) => {
    res.send(req.user)
  })

router.post('/register',
  rateLimiter({ points: 5, duration: 30 * 60 }),
  async (req, res, next) => {
    const descriptor = {
      name: [{ required: true, message: 'Your name is required.\n' }],
      password: [
        { required: true, message: 'Password is required.\n' },
        { min: 8, message: 'Password should have a minimum length of 8 characters.\n' },
        {
          pattern: /[a-zA-Z]/,
          message: 'Password should include at least one letter.\n',
        },
        { pattern: /\d/, message: 'Password should include at least one digit.\n' },
        { pattern: /[\W_]/, message: 'Password should include at least one symbol.\n' },
        { pattern: /^\S+$/, message: 'Password should not include spaces.\n' },
      ],
      passwordConfirmation: [
        { required: true, message: 'Password confirmation is required.\n' },
        {
          validator(rule, value, callback, source) {
            return source.password == value || new Error('The passwords you entered are inconsistent.\n')
          },
        },
      ],
      email: [
        { type: 'email', message: 'E-mail is not valid.\n' },
        { required: true, message: 'E-mail is required.\n' },
      ],
    }

    const validator = new Validator(descriptor)
    try {
      await validator.validate(req.body.user)
    } catch ({ errors }) {
      return next({ message: errors.map(e => e.message).join('') })
    }

    try {
      let createdUser = new User(req.body.user)

      const user = await User.register(createdUser, req.body.user.password)

      req.session.userId = user._id
      req.session.save()

      await ensureSingularity({
        userId: user._id,
        sessionId: req.session.id,
        computerId: req.session.computerId,
      })

      res.sendStatus(200)
    } catch (e) {
      return next(e)
    }
  })

const regenerateSessionMiddleware = (req, res, next) => {
  if (req.user) return next()

  const computerId = req.session.computerId

  req.session.regenerate(() => {
    req.session.computerId = computerId
    req.session.save(next)
  })
}

const preventLoginForLoggedInUsers = (req, res, next) => {
  next(req.user && new Error('User is already logged in'))
}

router.post(
  '/session',
  rateLimiter({ points: 10, duration: 30 * 60 }),
  preventLoginForLoggedInUsers,
  regenerateSessionMiddleware,
  passport.authenticate('local', { failWithError: true }),
  async (req, res) => {
    res.send(req.user)
  },
  (err, req, res, next) => {
    if (err.status != 401) return next(err)

    next(
      new Error('The username and password you provided did not match our records. Please double-check and try again.')
    )
  }
)

router.delete('/session',
  rateLimiter({ points: 50, duration: 10 * 60 }),
  async (req, res, next) => {
    const computerId = req.session && req.session.computerId

    await req.logout()

    req.session.regenerate(err => {
      if (err) return next(err)

      req.session.computerId = computerId

      res.sendStatus(200)
    })
  })

module.exports = router
