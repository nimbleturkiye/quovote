const mongoose = require('mongoose')

const connectionString =
  process.env.MONGO_CONNECTION_STRING || 'mongodb://mongodb:27017/quovote'

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

module.exports = { mongoose }
