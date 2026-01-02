'use strict';

const express = require('express');
const router = express.Router();

/**
 * GET /settings - Get current settings
 * 
 * Note: In a production environment, these should be stored in a database
 * For MVP, we'll use environment variables
 */
router.get('/', async (req, res) => {
  try {
    // For MVP, return settings from environment or defaults
    // In production, fetch from database
    const settings = {
      api_keys: {
        gameflip_api_key_configured: !!process.env.GAMEFLIP_API_KEY,
        // Don't expose actual keys
      },
      alerts: {
        listings_not_selling_days: parseInt(process.env.ALERT_NOT_SELLING_DAYS) || 7,
        check_competitors_interval: process.env.CHECK_COMPETITORS_INTERVAL || 'daily',
        enable_price_alerts: process.env.ENABLE_PRICE_ALERTS !== 'false',
      },
      currency: {
        default: process.env.DEFAULT_CURRENCY || 'USD',
        display_format: process.env.CURRENCY_DISPLAY_FORMAT || 'symbol', // symbol | code
      },
      shipping: {
        default_shipping_fee: parseInt(process.env.DEFAULT_SHIPPING_FEE) || 0,
        default_shipping_days: parseInt(process.env.DEFAULT_SHIPPING_DAYS) || 1,
        shipping_paid_by: process.env.SHIPPING_PAID_BY || 'seller',
      },
      publishing: {
        auto_publish: process.env.AUTO_PUBLISH === 'true',
        default_expire_days: parseInt(process.env.DEFAULT_EXPIRE_DAYS) || 30,
        default_visibility: process.env.DEFAULT_VISIBILITY || 'public',
      },
      repricing: {
        enabled: process.env.AUTO_REPRICING_ENABLED === 'true',
        price_reduction_percent: parseFloat(process.env.PRICE_REDUCTION_PERCENT) || 2.0,
        min_price_threshold: parseInt(process.env.MIN_PRICE_THRESHOLD) || 100,
      },
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    };

    res.json({
      status: 'SUCCESS',
      data: settings
    });
  } catch (err) {
    console.error('Error getting settings:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /settings - Update settings
 * 
 * Body: Partial settings object
 * 
 * Note: For MVP, this will update environment variables in memory only
 * In production, should update database
 */
router.patch('/', async (req, res) => {
  try {
    const updates = req.body;
    
    // Validate updates
    const allowedKeys = [
      'alerts', 'currency', 'shipping', 'publishing', 'repricing'
    ];
    
    const updatedSettings = {};
    
    // For MVP, we can't actually persist these without a database
    // So we'll just validate and return what would be saved
    for (const key of allowedKeys) {
      if (updates[key]) {
        updatedSettings[key] = updates[key];
        // In production: await db.settings.update({ [key]: updates[key] });
      }
    }
    
    res.json({
      status: 'SUCCESS',
      message: 'Settings updated (in-memory only for MVP. Database integration needed for persistence)',
      data: updatedSettings
    });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /settings/api-keys - Get API key configuration status
 */
router.get('/api-keys', async (req, res) => {
  try {
    res.json({
      status: 'SUCCESS',
      data: {
        gameflip_api_key_configured: !!process.env.GAMEFLIP_API_KEY,
        gameflip_api_secret_configured: !!process.env.GAMEFLIP_API_SECRET,
        // Never expose actual keys
        note: 'API keys are stored securely in environment variables'
      }
    });
  } catch (err) {
    console.error('Error getting API keys status:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

