'use strict';

const express = require('express');
const router = express.Router();
const { getGf } = require('../services/gameflip');

// GET /exchanges
router.get('/', async (req, res) => {
  try {
    const gf = getGf();
    
    // Build search parameters from query string
    const params = {};
    if (req.query.role) params.role = req.query.role;
    if (req.query.buyer) params.buyer = req.query.buyer;
    if (req.query.seller) params.seller = req.query.seller;
    if (req.query.status) params.status = req.query.status;
    if (req.query.limit) params.limit = parseInt(req.query.limit);
    if (req.query.start) params.start = parseInt(req.query.start);
    
    // If role is 'seller' and no seller specified, use current user
    if (params.role === 'seller' && !params.seller) {
      const profile = await gf.profile_get('me');
      params.owner = profile.owner; // Use owner parameter for seller searches
    } else if (params.role === 'seller' && params.seller) {
      params.owner = params.seller;
      delete params.seller;
    }
    
    // If role is 'buyer' and no buyer specified, use current user
    if (params.role === 'buyer' && !params.buyer) {
      const profile = await gf.profile_get('me');
      params.buyer = profile.owner;
    }
    
    const exchanges = await gf.exchange_search(params) || [];
    const exchangeList = Array.isArray(exchanges) ? exchanges : 
                        (exchanges.exchanges || exchanges.data || []);
    
    res.json({
      status: 'SUCCESS',
      data: exchangeList,
      count: exchangeList.length
    });
  } catch (err) {
    console.error('Error in exchanges route:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 :
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

module.exports = router;