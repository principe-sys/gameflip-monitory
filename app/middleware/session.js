const session = require('express-session');
const { getSession, setSession, deleteSession } = require('../services/sessionStore');

class InternalSessionStore extends session.Store {
  get(sid, callback) {
    getSession(sid)
      .then((data) => callback(null, data))
      .catch((err) => callback(err));
  }

  set(sid, sessionData, callback) {
    setSession(sid, sessionData)
      .then(() => callback(null))
      .catch((err) => callback(err));
  }

  destroy(sid, callback) {
    deleteSession(sid)
      .then(() => callback(null))
      .catch((err) => callback(err));
  }
}

function buildSessionMiddleware() {
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
    },
    store: new InternalSessionStore()
  };

  return session(sessionOptions);
}

module.exports = { buildSessionMiddleware };
