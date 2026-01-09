'use strict';

const express = require('express');
const router = express.Router();
const { getGf } = require('../services/gameflip');
const { requireGf } = require('../middleware/gfCredentials');

async function getAllExchanges(gf, params = {}) {
  let allExchanges = [];
  let nextPage = null;
  let iterations = 0;
  const MAX_ITERATIONS = 100;

  while (iterations < MAX_ITERATIONS) {
    const query = { ...params };
    if (nextPage) {
      query.nextPage = nextPage;
    }
    const result = await gf.exchange_search(query);
    let exchanges = [];
    let foundNextPage = null;

    if (Array.isArray(result)) {
      exchanges = result;
    } else if (result && typeof result === 'object') {
      exchanges = result.exchanges || result.data || [];
      foundNextPage = result.next_page || null;
    }

    if (exchanges.length > 0) {
      allExchanges = allExchanges.concat(exchanges);
    }

    if (foundNextPage) {
      nextPage = foundNextPage;
      iterations += 1;
    } else {
      break;
    }
  }

  return allExchanges;
}

// GET /exchanges
router.get('/', requireGf, async (req, res) => {
  try {
    const gf = req.gf || getGf();
    
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
    
    const exchangeList = await getAllExchanges(gf, params);
    
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
