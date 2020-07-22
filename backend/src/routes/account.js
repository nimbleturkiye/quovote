const express = require('express');
const router = express.Router();

const User = require('../models/user');

router.post('/register', async (req, res, next) => {
  console.log(req.body.user);

  try {
    const user = await User.register(new User(req.body.user), req.body.user.password);
    console.log('user logged in', user)

    res.sendStatus(200)
  } catch(e) {
    return next(e)
  }
})

module.exports = router;
