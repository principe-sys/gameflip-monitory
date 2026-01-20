const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { getRedisClient } = require('../services/redis');

function buildSessionMiddleware() {
  const redisClient = getRedisClient();
  const isProduction = process.env.NODE_ENV === 'production';

  const sessionOptions = {
    name: 'gfapp.sid',
    secret: process.env.SESSION_SECRET || 'dev-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: process.env.COOKIE_SAMESITE || (isProduction ? 'lax' : 'lax'),
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  };

  if (redisClient) {
    sessionOptions.store = new RedisStore({ client: redisClient });
  }

  return session(sessionOptions);
}

module.exports = { buildSessionMiddleware };
