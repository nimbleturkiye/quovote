const { RateLimiterMongo } = require('rate-limiter-flexible');
const { mongoose } = require('../bootstrap');
const get = require('lodash/get');

const limiters = {}

const defaultOptions = {
  tableName: 'rate-limiting',
  storeClient: mongoose.connection,
  points: 100, // Number of requests
  duration: 60 * 10, // Per second(s)
  inmemoryBlockOnConsumed: 300
};

const defaultRateLimiter = new RateLimiterMongo(defaultOptions);

const rateLimiterMiddleware = (opts) => {
  let limiter = defaultRateLimiter

  let keys = opts?.keys || []
  let key = ''

  if (!Array.isArray(keys)) keys = [keys]

  if (opts) {
    const { points, duration, id } = { ...defaultOptions, ...opts }
    key = `${keys.join('_')}-${points}-${duration}`

    limiter = limiters[key] = limiters[key] || new RateLimiterMongo({ ...defaultOptions, points, duration, keyPrefix: id || key })
  }
  console.log(opts, limiter)

  return async (req, res, next) => {
    if (!keys.every(key => get(req, key))) return next({ status: 400 })

    const consumeKey = keys.map(key => get(req, key)).join('_') || req.ip

    try {
      await limiter.consume(consumeKey)
      next()
    }
    catch (e) {
      console.log('rate limiting', consumeKey, e)
      next({ status: 429, message: 'Too Many Requests' });
    }
  };
}

module.exports = rateLimiterMiddleware;
