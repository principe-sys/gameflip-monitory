const GfApi = require('../services/gameflip');
const { listAccounts, getDecryptedSecret } = require('../services/accountStore');

async function resolveCredentials(req) {
  if (req.session && req.session.activeAccountId && req.session.userId) {
    const accounts = await listAccounts(req.session.userId);
    const account = accounts.find((item) => item.id === req.session.activeAccountId);
    if (account) {
      return {
        source: 'session',
        accountId: account.id,
        name: account.name,
        apiKey: account.apiKey,
        apiSecret: getDecryptedSecret(account)
      };
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    const headerKey = req.get('x-gf-api-key');
    const headerSecret = req.get('x-gf-api-secret');
    if (headerKey && headerSecret) {
      return {
        source: 'header',
        apiKey: headerKey,
        apiSecret: headerSecret
      };
    }
  }

  if (process.env.GAMEFLIP_API_KEY && (process.env.GAMEFLIP_API_SECRET || process.env.GFAPI_SECRET)) {
    return {
      source: 'env',
      apiKey: process.env.GAMEFLIP_API_KEY || process.env.GFAPI_KEY,
      apiSecret: process.env.GAMEFLIP_API_SECRET || process.env.GFAPI_SECRET
    };
  }

  return null;
}

function createGfClient(creds) {
  return new GfApi(creds.apiKey, creds.apiSecret, {
    environment: process.env.GAMEFLIP_ENV || (process.env.NODE_ENV === 'test' ? 'test' : 'production'),
    logLevel: process.env.LOG_LEVEL || 'info'
  });
}

function gfCredentials() {
  return async (req, res, next) => {
    try {
      const creds = await resolveCredentials(req);
      if (creds) {
        req.gfCredentials = {
          source: creds.source,
          accountId: creds.accountId,
          name: creds.name
        };
        req.gf = createGfClient(creds);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

function requireGf(req, res, next) {
  if (!req.gf) {
    return res.status(401).json({ error: 'Missing GameFlip credentials' });
  }
  return next();
}

module.exports = { gfCredentials, requireGf };
