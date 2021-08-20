const createError = require('http-errors')
const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const passport = require('passport')
const cors = require('cors')
const helmet = require('helmet')
const sanitize = require('express-mongo-sanitize').sanitize
const compression = require('compression')
const { errors } = require('celebrate')

const rateLimiter = require('./lib/rate-limiter')

const User = require('./models/user')
const { mongoose } = require('./bootstrap')

const indexRouter = require('./routes/index')
const accountRouter = require('./routes/account')

const app = express()

app.use(helmet())
app.use(compression())

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://quo.vote' : true,
    credentials: true
  })
)

app.set('trust proxy', 1)

app.use(
  session({
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      stringify: false
    }),
    secret: 'thisissupposedtobeasecret',
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === 'production' && 'none',
      secure: process.env.NODE_ENV === 'production'
    }
  })
)

app.use(passport.initialize())
app.use(passport.session())

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// view engine setup
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(rateLimiter({ keys: ['ip', 'session.id'] }))

app.all('*', (req, res, next) => {
  req.body = sanitize(req.body)
  req.headers = sanitize(req.headers)
  req.params = sanitize(req.params)

  next()
})

app.use('/', indexRouter)
app.use('/account', accountRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

app.use(errors())

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  console.log(err)

  res.status(err.status || 500)
  res.send(
    req.app.get('env') === 'development'
      ? { stack: err.stack, message: err.message }
      : { message: err.message }
  )
})

module.exports = app
