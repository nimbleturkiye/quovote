const Singularity = require('../models/singularity')

module.exports = async function ensureSingularity({
  sessionId,
  userId,
  computerId
}) {
  await Singularity.findOneAndUpdate(
    {
      $or: [{ sessionId }, { userId }, { computerId }]
    },
    {
      $addToSet: {
        sessionId,
        userId,
        computerId
      }
    },
    { upsert: true }
  )
}
