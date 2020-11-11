const mongoose = require('mongoose')

const Singularity = new mongoose.Schema(
  {
    userId: ['ObjectId'],
    sessionId: [String],
    computerId: [String],
  },
  { timestamps: true }
)

module.exports = mongoose.model('Singularity', Singularity)
