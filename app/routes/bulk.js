'use strict';

const express = require('express');
const router = express.Router();
const { getGf } = require('../services/gameflip');

// GET /bulk - Get user's bulk objects
router.get('/', async (req, res) => {
  try {
    const gf = getGf();
    
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.limit) query.limit = parseInt(req.query.limit);
    
    const bulks = await gf.bulk_mine_get(query) || [];
    const bulkList = Array.isArray(bulks) ? bulks : 
                    (bulks.data || []);
    
    res.json(bulkList);
  } catch (err) {
    console.error('Error getting bulk objects:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 : 
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

// POST /bulk - Create a new bulk object
router.post('/', async (req, res) => {
  try {
    const gf = getGf();
    const bulk = await gf.bulk_post();
    res.status(201).json(bulk);
  } catch (err) {
    console.error('Error creating bulk:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

// GET /bulk/:id - Get a single bulk object
router.get('/:id', async (req, res) => {
  try {
    const gf = getGf();
    const bulk = await gf.bulk_get(req.params.id);
    res.json(bulk);
  } catch (err) {
    console.error('Error getting bulk:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 : 
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

// PUT /bulk/:id - Update bulk (initiate trade offer or get latest)
router.put('/:id', async (req, res) => {
  try {
    const gf = getGf();
    // If body has items, create trade offer, otherwise just get latest
    const data = Object.keys(req.body).length > 0 ? req.body : null;
    const bulk = await gf.bulk_put(req.params.id, data);
    res.json(bulk);
  } catch (err) {
    console.error('Error updating bulk:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 : 
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

module.exports = router;

