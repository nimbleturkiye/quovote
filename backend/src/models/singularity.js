const mongoose = require('mongoose')

const Singularity = new mongoose.Schema({
  userId: ['ObjectId'],
  sessionId: [String],
  computerId: [String],
})

Singularity.index({ userId: 1, sessionId: 1, computerId: 1 }, { unique: true })

module.exports = mongoose.model('Singularity', Singularity)
