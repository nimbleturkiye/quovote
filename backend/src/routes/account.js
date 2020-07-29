const express = require('express')
const passport = require('passport')
const User = require('../models/user')

const ensureSingularity = require('../lib/ensureSingularity')

const router = express.Router()

router.get('/', async (req, res) => {
  res.send(req.user)
})

router.post('/register', async (req, res, next) => {
  try {
    let createdUser

    if (req.session.userId) {
      createdUser = await User.findById(req.session.userId)
      createdUser.email = req.body.user.email
    } else createdUser = new User(req.body.user)

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

router.post('/login', passport.authenticate('local'), async (req, res, next) => {
  console.log('is user logged in ', req.session)
  res.send(req.user)
})

module.exports = router
