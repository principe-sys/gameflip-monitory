const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const { buildSessionMiddleware } = require('./middleware/session');
const { gfCredentials } = require('./middleware/gfCredentials');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const corsOrigin = process.env.CORS_ORIGIN;
if (corsOrigin) {
codex/migrate-features-from-gfapi-to-gameflip-monitory-44cpqz
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    return next();
  });
=======
  app.use(cors({ origin: corsOrigin, credentials: true }));
main
}

app.use(buildSessionMiddleware());
app.use(gfCredentials());

const apiRouter = express.Router();

apiRouter.use('/accounts', require('./routes/accounts'));
apiRouter.use('/auth', require('./routes/auth'));
apiRouter.use('/analytics', require('./routes/analytics'));
apiRouter.use('/bulk', require('./routes/bulk'));
apiRouter.use('/competitors', require('./routes/competitors'));
apiRouter.use('/dashboard', require('./routes/dashboard'));
apiRouter.use('/debug', require('./routes/debug'));
apiRouter.use('/exchanges', require('./routes/exchanges'));
apiRouter.use('/health', require('./routes/health'));
apiRouter.use('/listings', require('./routes/listings'));
apiRouter.use('/products', require('./routes/products'));
apiRouter.use('/profile', require('./routes/profile'));
apiRouter.use('/settings', require('./routes/settings'));
apiRouter.use('/steam', require('./routes/steam'));
apiRouter.use('/wallet', require('./routes/wallet'));

apiRouter.get('/', (req, res) => {
    res.json({
        message: 'GameFlip API Server',
        version: '1.0.0',
        endpoints: {
            accounts: [
                'GET /api/accounts',
                'GET /api/accounts/:listingId',
                'POST /api/accounts',
                'POST /api/accounts/:listingId/digital-code',
                'PUT /api/accounts/:listingId/publish'
            ],
            analytics: [
                'GET /api/analytics/overview',
                'GET /api/analytics/listings',
                'GET /api/analytics/sales',
                'GET /api/analytics/alerts'
            ],
            bulk: [
                'GET /api/bulk',
                'GET /api/bulk/:id',
                'POST /api/bulk',
                'PUT /api/bulk/:id'
            ],
            competitors: [
                'GET /api/competitors',
                'GET /api/competitors/:id',
                'POST /api/competitors',
                'GET /api/competitors/:id/listings',
                'GET /api/competitors/:id/analytics',
                'DELETE /api/competitors/:id'
            ],
            dashboard: [
                'GET /api/dashboard/summary',
                'GET /api/dashboard/listings',
                'GET /api/dashboard/listings?status=draft|ready|onsale|sold'
            ],
            exchanges: [
                'GET /api/exchanges',
                'GET /api/exchanges?role=buyer|seller&status=complete'
            ],
            listings: [
                'GET /api/listings',
                'GET /api/listings?owner=me',
                'GET /api/listings/:id',
                'POST /api/listings',
                'PATCH /api/listings/:id',
                'PUT /api/listings/:id/status',
                'DELETE /api/listings/:id',
                'GET /api/listings/:id/digital-goods',
                'PUT /api/listings/:id/digital-goods',
                'POST /api/listings/:id/photo'
            ],
            products: [
                'GET /api/products',
                'GET /api/products/:id'
            ],
            profile: [
                'GET /api/profile',
                'GET /api/profile?id=user_id'
            ],
            settings: [
                'GET /api/settings',
                'PATCH /api/settings',
                'GET /api/settings/api-keys'
            ],
            steam: [
                'GET /api/steam/escrows',
                'GET /api/steam/escrows/:id',
                'GET /api/steam/trade-ban',
                'GET /api/steam/inventory/:profileId/:appId'
            ],
            wallet: [
                'GET /api/wallet',
                'GET /api/wallet?owner=me&balance_only=true'
            ],
            health: [
                'GET /api/health'
            ]
        },
        documentation: 'See src/samples/ for usage examples'
    });
});

app.use('/api', apiRouter);

// Middleware para manejo de errores
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.use('/api', (req, res) => {
    console.log(`Route not found: ${req.method} ${req.url}`);
    res.status(404).json({
        error: 'Route not found',
        method: req.method,
        url: req.url
    });
});

const distPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      // si no existe dist/index.html, devolvemos algo claro
      res.status(500).json({ error: 'Frontend build missing', details: 'frontend/dist/index.html not found' });
    }
  });
});

app.listen(port, () => {
    console.log(`GFAPI server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`API Key configured: ${!!process.env.GAMEFLIP_API_KEY}`);
});
