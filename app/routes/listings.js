'use strict';

const express = require('express');
const router = express.Router();
const { getGf } = require('../services/gameflip');

// GET /listings - Get user's listings or search listings
router.get('/', async (req, res) => {
  try {
    const gf = getGf();
    
    // If owner parameter is provided, get user's listings
    if (req.query.owner !== undefined) {
      const owner = req.query.owner || 'me';
      const listings = await gf.listing_of(owner) || [];
      const listingList = Array.isArray(listings) ? listings : 
                         (listings.data || listings.listings || []);
      return res.json(listingList);
    }
    
    // Otherwise, search listings with query parameters
    const query = { v2: true };
    Object.keys(req.query).forEach(key => {
      if (key !== 'v2') {
        query[key] = req.query[key];
      }
    });
    
    const results = await gf.listing_search(query) || {};
    const listings = Array.isArray(results) ? results : 
                    (results.listings || results.data || []);
    
    res.json({
      listings: listings,
      found: results.found || listings.length,
      next_page: results.next_page || null
    });
  } catch (err) {
    console.error('Error in listings route:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 : 
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

// GET /listings/:id - Get a single listing
router.get('/:id', async (req, res) => {
  try {
    const gf = getGf();
    const listing = await gf.listing_get(req.params.id);
    res.json(listing);
  } catch (err) {
    console.error('Error getting listing:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 : 
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

// POST /listings - Create a new listing
router.post('/', async (req, res) => {
  try {
    const gf = getGf();
    const listing = await gf.listing_post(req.body);
    res.status(201).json(listing);
  } catch (err) {
    console.error('Error creating listing:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('400') ? 400 :
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

// PATCH /listings/:id - Update a listing
router.patch('/:id', async (req, res) => {
  try {
    const gf = getGf();
    const listing = await gf.listing_patch(req.params.id, req.body);
    res.json(listing);
  } catch (err) {
    console.error('Error updating listing:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 : 
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

// PUT /listings/:id/status - Change listing status
router.put('/:id/status', async (req, res) => {
  try {
    const gf = getGf();
    const status = req.body.status;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const listing = await gf.listing_status(req.params.id, status);
    res.json(listing);
  } catch (err) {
    console.error('Error changing listing status:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 : 
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

// DELETE /listings/:id - Delete a listing
router.delete('/:id', async (req, res) => {
  try {
    const gf = getGf();
    const result = await gf.listing_delete(req.params.id);
    res.json(result || { success: true });
  } catch (err) {
    console.error('Error deleting listing:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 : 
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

// GET /listings/:id/digital-goods - Get digital goods
router.get('/:id/digital-goods', async (req, res) => {
  try {
    const gf = getGf();
    const digitalGoods = await gf.digital_goods_get(req.params.id);
    res.json(digitalGoods);
  } catch (err) {
    console.error('Error getting digital goods:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 : 
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

// PUT /listings/:id/digital-goods - Set digital goods
router.put('/:id/digital-goods', async (req, res) => {
  try {
    const gf = getGf();
    const code = req.body.code;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    const result = await gf.digital_goods_put(req.params.id, code);
    res.json(result);
  } catch (err) {
    console.error('Error setting digital goods:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('400') ? 400 :
                       errorMessage.includes('404') ? 404 : 
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

// POST /listings/:id/photo - Upload photo
router.post('/:id/photo', async (req, res) => {
  try {
    const gf = getGf();
    const { url, display_order } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Photo URL is required' });
    }
    const result = await gf.upload_photo(req.params.id, url, display_order);
    res.json(result);
  } catch (err) {
    console.error('Error uploading photo:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('400') ? 400 :
                       errorMessage.includes('404') ? 404 : 
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

module.exports = router;