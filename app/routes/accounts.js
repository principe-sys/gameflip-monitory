'use strict';

const express = require('express');
const router = express.Router();
const { getGf } = require('../services/gameflip');

/**
 * POST /accounts - Create a new account listing
 * Body should include:
 * {
 *   name: string,
 *   description: string,
 *   platform: string (e.g., "xbox_series", "playstation_5", etc.),
 *   price: number (in cents),
 *   photo_url: string (optional),
 *   tags: array (e.g., ["profile: Changeable", "password: Changeable", "email: Included"]),
 *   shipping_within_days: number (default: 1),
 *   expire_in_days: number (default: 30),
 *   accept_currency: string ("USD" | "FLP" | "BOTH", default: "USD"),
 *   digital_deliverable: string ("code" | "transfer", default: "code")
 * }
 */
router.post('/', async (req, res) => {
  try {
    const gf = getGf();
    
    // Extract data from request body
    const {
      name,
      description,
      platform,
      price,
      photo_url,
      tags = [],
      shipping_within_days = 1,
      expire_in_days = 30,
      accept_currency = 'USD',
      digital_deliverable = 'code'
    } = req.body;

    // Validation
    if (!name || !description || !platform || !price) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, description, platform, and price are required' 
      });
    }

    // Build listing query for account
    const listingQuery = {
      name: name,
      description: description,
      platform: platform,
      price: parseInt(price), // Price in cents
      
      // Account-specific settings
      category: 'ACCOUNT',
      kind: 'item',
      digital: true,
      digital_region: 'none',
      digital_deliverable: digital_deliverable,
      
      // Shipping settings (for digital items)
      shipping_predefined_package: 'None',
      shipping_fee: 0,
      shipping_paid_by: 'seller',
      shipping_within_days: shipping_within_days,
      
      // Listing settings
      expire_in_days: expire_in_days,
      accept_currency: accept_currency,
      
      // Tags for account listings (commonly used)
      tags: Array.isArray(tags) ? tags : []
    };

    // Create the listing
    const listing = await gf.listing_post(listingQuery);

    // Upload photo if provided
    if (photo_url && listing && listing.id) {
      try {
        await gf.upload_photo(listing.id, photo_url, 0);
        // Refresh listing to get updated photo info
        const updatedListing = await gf.listing_get(listing.id);
        listing.photo = updatedListing.photo;
      } catch (photoErr) {
        console.warn('Warning: Photo upload failed:', photoErr.message);
        // Continue even if photo upload fails
      }
    }

    // Set listing to ready status (can be changed to 'onsale' to publish immediately)
    const status = req.body.status || 'ready'; // 'ready' or 'onsale'
    if (status === 'onsale' && listing && listing.id) {
      try {
        await gf.listing_status(listing.id, 'onsale');
        listing.status = 'onsale';
      } catch (statusErr) {
        console.warn('Warning: Failed to set status to onsale:', statusErr.message);
      }
    }

    res.status(201).json({
      success: true,
      listing: listing,
      message: status === 'onsale' 
        ? 'Account listing created and published successfully' 
        : 'Account listing created successfully (status: ready)'
    });

  } catch (err) {
    console.error('Error creating account listing:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('400') ? 400 :
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

/**
 * POST /accounts/:listingId/digital-code - Set the digital code for an account listing
 * Body: { code: string }
 */
router.post('/:listingId/digital-code', async (req, res) => {
  try {
    const gf = getGf();
    const { listingId } = req.params;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const result = await gf.digital_goods_put(listingId, code);
    res.json({
      success: true,
      message: 'Digital code set successfully',
      listing_id: listingId
    });

  } catch (err) {
    console.error('Error setting digital code:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('400') ? 400 :
                       errorMessage.includes('404') ? 404 : 
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

/**
 * PUT /accounts/:listingId/publish - Publish an account listing (change status to onsale)
 */
router.put('/:listingId/publish', async (req, res) => {
  try {
    const gf = getGf();
    const { listingId } = req.params;

    const listing = await gf.listing_status(listingId, 'onsale');
    res.json({
      success: true,
      message: 'Account listing published successfully',
      listing: listing
    });

  } catch (err) {
    console.error('Error publishing account listing:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 : 
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

/**
 * GET /accounts - Get account listings (filtered by category=ACCOUNT)
 */
router.get('/', async (req, res) => {
  try {
    const gf = getGf();
    const owner = req.query.owner || 'me';
    
    // Search for account listings
    const query = {
      category: 'ACCOUNT',
      owner: owner,
      v2: true
    };

    // Add optional filters
    if (req.query.status) query.status = req.query.status;
    if (req.query.platform) query.platform = req.query.platform;

    const results = await gf.listing_search(query) || {};
    const listings = Array.isArray(results) ? results : 
                    (results.listings || results.data || []);
    
    res.json({
      listings: listings,
      found: results.found || listings.length,
      next_page: results.next_page || null
    });

  } catch (err) {
    console.error('Error getting account listings:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 : 
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

/**
 * GET /accounts/:listingId - Get a specific account listing
 */
router.get('/:listingId', async (req, res) => {
  try {
    const gf = getGf();
    const listing = await gf.listing_get(req.params.listingId);
    
    // Verify it's an account listing
    if (listing.category !== 'ACCOUNT') {
      return res.status(400).json({ error: 'This listing is not an account listing' });
    }

    res.json(listing);

  } catch (err) {
    console.error('Error getting account listing:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 : 
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

module.exports = router;

