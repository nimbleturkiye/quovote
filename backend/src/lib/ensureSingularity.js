const Singularity = require('../models/singularity')

module.exports = async function ensureSingularity(singularity) {
  try {
    await Singularity.create(singularity)
  } catch (e) {
    console.log('this user was previously seen', singularity)
  }
}
