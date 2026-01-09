const crypto = require('crypto');
const { getSession, setSession, deleteSession } = require('../services/sessionStore');

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((acc, item) => {
    const [key, ...rest] = item.trim().split('=');
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

function signValue(value, secret) {
  const signature = crypto.createHmac('sha256', secret).update(value).digest('hex');
  return `${value}.${signature}`;
}

function unsignValue(value, secret) {
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }
  return payload;
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  parts.push(`Path=${options.path || '/'}`);
  return parts.join('; ');
}

function buildSessionMiddleware() {
  const secret = process.env.SESSION_SECRET || 'dev-session-secret';
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: process.env.COOKIE_SAMESITE || (isProduction ? 'Lax' : 'Lax'),
    maxAge: 60 * 60 * 24 * 7
  };

  const stripSession = (session) => {
    const { save, destroy, _dirty, ...rest } = session;
    return rest;
  };

  return async (req, res, next) => {
    const cookies = parseCookies(req.headers.cookie || '');
    const rawSession = cookies['gfapp.sid'];
    const sessionId = unsignValue(rawSession, secret);
    let sessionData = sessionId ? await getSession(sessionId) : null;

    if (!sessionData) {
      sessionData = {};
    }

    const session = {
      id: sessionId || crypto.randomUUID(),
      ...sessionData,
      save: async () => {
        await setSession(session.id, stripSession(session));
        session._dirty = false;
      },
      destroy: async (cb) => {
        await deleteSession(session.id);
        res.setHeader('Set-Cookie', serializeCookie('gfapp.sid', '', { ...cookieOptions, maxAge: 0 }));
        if (cb) cb();
      },
      _dirty: false
    };

    req.session = session;

    res.on('finish', async () => {
      if (session._dirty) {
        await setSession(session.id, stripSession(session));
      }
    });

    if (!rawSession || !sessionId) {
      const signed = signValue(session.id, secret);
      res.setHeader('Set-Cookie', serializeCookie('gfapp.sid', signed, cookieOptions));
      session._dirty = true;
    }

    const originalSet = req.session;
    req.session = new Proxy(originalSet, {
      set(target, prop, value) {
        target[prop] = value;
        target._dirty = true;
        return true;
      }
    });

    next();
  };
}

module.exports = { buildSessionMiddleware };
