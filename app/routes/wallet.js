const express = require('express');
const router = express.Router();
const GfApi = require('../services/gameflip');

router.get('/', async (req, res) => {
    try {
        console.log('[WALLET] Creating GfApi instance...');
        const gf = new GfApi(
            process.env.GAMEFLIP_API_KEY || process.env.GFAPI_KEY,
            {
                secret: process.env.GAMEFLIP_API_SECRET || process.env.GFAPI_SECRET,
                algorithm: "SHA1",
                digits: 6,
                period: 30
            },
            { logLevel: 'debug' }
        );
        
        console.log('[WALLET] Getting profile first...');
        const profile = await gf.profile_get();
        console.log('[WALLET] Profile owner:', profile.owner);
        
        console.log('[WALLET] Getting wallet...');
        const wallet = await gf.wallet_get(profile.owner);
        
        console.log('[WALLET] Success!');
        res.json(wallet);
    } catch(err) {
        console.error('[WALLET] Error:', err);
        res.status(500).json({ 
            error: err.message,
            details: err.stack 
        });
    }
});

module.exports = router;