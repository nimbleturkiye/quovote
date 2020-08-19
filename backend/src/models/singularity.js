const mongoose = require('mongoose')

const Singularity = new mongoose.Schema({
  userId: ['ObjectId'],
  sessionId: [String],
  computerId: [String],
})

module.exports = mongoose.model('Singularity', Singularity)
