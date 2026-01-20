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
  app.use(cors({ origin: corsOrigin, credentials: true }));
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
    endpoints: { /* ... lo que ya tenías ... */ },
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
      res.status(500).json({
        error: 'Frontend build missing',
        details: 'frontend/dist/index.html not found'
      });
    }
  });
});

app.listen(port, () => {
  console.log(`GFAPI server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`API Key configured: ${!!process.env.GAMEFLIP_API_KEY}`);
  console.log("DEPLOY_TAG: FIX_MERGE_CONFLICTS_2026_01_20");
});
