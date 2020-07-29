const express = require('express')
const passport = require('passport')
const User = require('../models/user')


const router = express.Router()

router.get('/', async (req, res) => {
  res.send(req.user)
})

router.post('/register', async (req, res, next) => {
  try {
    const user = await User.register(new User(req.body.user), req.body.user.password);
    console.log('user logged in', user)

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
