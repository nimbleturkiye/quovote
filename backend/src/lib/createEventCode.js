const Event = require('../models/event')

module.exports = async function createEventCode(code) {
  if (code.length < 4) return

  const event = await Event.findOne({ code })
  if (!event) return code

  let r = Math.random().toString(36).substring(9)
  code = code.substring(0, 4) + r
  return await createEventCode(code)
}
