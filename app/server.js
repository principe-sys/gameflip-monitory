const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Registrar todas las rutas
app.use('/accounts', require('./routes/accounts'));
app.use('/analytics', require('./routes/analytics'));
app.use('/bulk', require('./routes/bulk'));
app.use('/competitors', require('./routes/competitors'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/exchanges', require('./routes/exchanges'));
app.use('/health', require('./routes/health'));
app.use('/listings', require('./routes/listings'));
app.use('/products', require('./routes/products'));
app.use('/profile', require('./routes/profile'));
app.use('/settings', require('./routes/settings'));
app.use('/steam', require('./routes/steam'));
app.use('/wallet', require('./routes/wallet'));

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        message: 'GameFlip API Server',
        version: '1.0.0',
        endpoints: {
            accounts: [
                'GET /accounts',
                'GET /accounts/:listingId',
                'POST /accounts',
                'POST /accounts/:listingId/digital-code',
                'PUT /accounts/:listingId/publish'
            ],
            analytics: [
                'GET /analytics/overview',
                'GET /analytics/listings',
                'GET /analytics/sales',
                'GET /analytics/alerts'
            ],
            bulk: [
                'GET /bulk',
                'GET /bulk/:id',
                'POST /bulk',
                'PUT /bulk/:id'
            ],
            competitors: [
                'GET /competitors',
                'GET /competitors/:id',
                'POST /competitors',
                'GET /competitors/:id/listings',
                'GET /competitors/:id/analytics',
                'DELETE /competitors/:id'
            ],
            dashboard: [
                'GET /dashboard/summary',
                'GET /dashboard/listings',
                'GET /dashboard/listings?status=draft|ready|onsale|sold'
            ],
            exchanges: [
                'GET /exchanges',
                'GET /exchanges?role=buyer|seller&status=complete'
            ],
            listings: [
                'GET /listings',
                'GET /listings?owner=me',
                'GET /listings/:id',
                'POST /listings',
                'PATCH /listings/:id',
                'PUT /listings/:id/status',
                'DELETE /listings/:id',
                'GET /listings/:id/digital-goods',
                'PUT /listings/:id/digital-goods',
                'POST /listings/:id/photo'
            ],
            products: [
                'GET /products',
                'GET /products/:id'
            ],
            profile: [
                'GET /profile',
                'GET /profile?id=user_id'
            ],
            settings: [
                'GET /settings',
                'PATCH /settings',
                'GET /settings/api-keys'
            ],
            steam: [
                'GET /steam/escrows',
                'GET /steam/escrows/:id',
                'GET /steam/trade-ban',
                'GET /steam/inventory/:profileId/:appId'
            ],
            wallet: [
                'GET /wallet',
                'GET /wallet?owner=me&balance_only=true'
            ],
            health: [
                'GET /health'
            ]
        },
        documentation: 'See src/samples/ for usage examples'
    });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
    console.log(`Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ 
        error: 'Route not found',
        method: req.method,
        url: req.url
    });
});

app.listen(port, () => {
    console.log(`GFAPI server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`API Key configured: ${!!process.env.GAMEFLIP_API_KEY}`);
});