var createError = require('http-errors')
var express = require('express')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const passport = require('passport')
const cors = require('cors')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const { errors } = require('celebrate');

const User = require('./models/user')
const { mongoose } = require('./bootstrap')

var indexRouter = require('./routes/index')
var accountRouter = require('./routes/account')

var app = express()

app.use(helmet())

app.use(
  cors({
    origin: process.env.NODE_ENV == 'production' ? 'https://quo.vote' : true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  })
)

app.set('trust proxy', 1)

app.use(
  session({
    store: new MongoStore({ mongooseConnection: mongoose.connection, stringify: false }),
    secret: 'thisissupposedtobeasecret',
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV == 'production' && 'none',
      secure: process.env.NODE_ENV == 'production',
    },
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

app.use(mongoSanitize())

app.use('/', indexRouter)
app.use('/account', accountRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

app.use(errors());

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  res.status(err.status || 500)
  res.send(req.app.get('env') === 'development' ? { stack: err.stack, message: err.message } : { message: err.message })
})

module.exports = app
