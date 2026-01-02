'use strict';

const express = require('express');
const router = express.Router();
const { getGf } = require('../services/gameflip');

// GET /products - Search products
router.get('/', async (req, res) => {
  try {
    const gf = getGf();
    
    const query = {};
    Object.keys(req.query).forEach(key => {
      query[key] = req.query[key];
    });
    
    const results = await gf.product_search(query) || {};
    const products = Array.isArray(results) ? results : 
                    (results.products || results.data || []);
    
    res.json({
      products: products,
      found: results.found || products.length,
      next_page: results.next_page || null
    });
  } catch (err) {
    console.error('Error searching products:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 : 
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

// GET /products/:id - Get a single product
router.get('/:id', async (req, res) => {
  try {
    const gf = getGf();
    const product = await gf.product_get(req.params.id);
    res.json(product);
  } catch (err) {
    console.error('Error getting product:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 : 
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

module.exports = router;

