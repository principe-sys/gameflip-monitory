'use strict';

const express = require('express');
const router = express.Router();
const { getGf } = require('../services/gameflip');
const { requireGf } = require('../middleware/gfCredentials');

/**
 * POST /competitors - Create a competitor profile
 * Body: { owner_id, username, notes? }
 */
router.post('/', async (req, res) => {
  try {
    const { owner_id, username, notes } = req.body;
    
    if (!owner_id) {
      return res.status(400).json({ error: 'owner_id is required' });
    }

    // TODO: Store in database (PostgreSQL/MongoDB)
    // For now, return a placeholder structure
    const competitor = {
      id: `comp_${Date.now()}`,
      owner_id,
      username: username || owner_id,
      notes: notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // In a real implementation, save to DB here
    // await db.competitors.insert(competitor);

    res.status(201).json({
      status: 'SUCCESS',
      data: competitor
    });
  } catch (err) {
    console.error('Error creating competitor:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /competitors - List all competitor profiles
 */
router.get('/', async (req, res) => {
  try {
    // TODO: Fetch from database
    // For now, return empty array
    const competitors = [];
    
    // In a real implementation:
    // const competitors = await db.competitors.find({});
    
    res.json({
      status: 'SUCCESS',
      data: competitors,
      count: competitors.length
    });
  } catch (err) {
    console.error('Error listing competitors:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /competitors/:id - Get a single competitor profile
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Fetch from database
    // const competitor = await db.competitors.findById(id);
    
    res.json({
      status: 'SUCCESS',
      data: {
        id,
        message: 'Competitor profile. Database integration needed.'
      }
    });
  } catch (err) {
    console.error('Error getting competitor:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /competitors/:id/listings - Get listings from a competitor
 * This fetches listings using GameFlip API by owner_id
 */
router.get('/:id/listings', requireGf, async (req, res) => {
  try {
    const { id } = req.params;
    const gf = req.gf || getGf();
    
    // Get query parameters for filtering
    const query = {
      owner: id, // owner_id of competitor
      v2: true,
      limit: parseInt(req.query.limit) || 50
    };
    
    if (req.query.status) query.status = req.query.status;
    if (req.query.category) query.category = req.query.category;
    if (req.query.platform) query.platform = req.query.platform;
    
    // Fetch listings using GameFlip API
    const result = await gf.listing_search(query);
    
    let listings = [];
    if (result) {
      if (Array.isArray(result)) {
        listings = result;
      } else if (result.listings && Array.isArray(result.listings)) {
        listings = result.listings;
      } else if (result.data && Array.isArray(result.data)) {
        listings = result.data;
      }
    }
    
    // TODO: Store in database for historical tracking
    // await db.competitor_listings.insertMany(listings.map(l => ({
    //   ...l,
    //   competitor_id: id,
    //   fetched_at: new Date()
    // })));
    
    res.json({
      status: 'SUCCESS',
      data: {
        competitor_id: id,
        listings: listings,
        count: listings.length,
        next_page: result?.next_page || null
      }
    });
  } catch (err) {
    console.error('Error fetching competitor listings:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 :
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

/**
 * GET /competitors/:id/analytics - Compare competitor prices with your listings
 */
router.get('/:id/analytics', requireGf, async (req, res) => {
  try {
    const { id } = req.params; // competitor owner_id
    const gf = req.gf || getGf();
    
    // Get your profile to fetch your listings
    const profile = await gf.profile_get('me');
    const yourOwnerId = profile.owner;
    
    // Fetch competitor listings
    const competitorListings = await gf.listing_search({ owner: id, v2: true, limit: 100 }) || {};
    const competitorList = Array.isArray(competitorListings) ? competitorListings :
                          (competitorListings.listings || competitorListings.data || []);
    
    // Fetch your listings
    const yourListings = await gf.listing_search({ owner: yourOwnerId, v2: true, limit: 100 }) || {};
    const yourList = Array.isArray(yourListings) ? yourListings :
                    (yourListings.listings || yourListings.data || []);
    
    // Create comparison data
    // Group by UPC, category, or name to compare similar items
    const comparison = {
      competitor_id: id,
      competitor_listings_count: competitorList.length,
      your_listings_count: yourList.length,
      matches: [],
      opportunities: []
    };
    
    // Simple matching by name and category
    competitorList.forEach(compListing => {
      const match = yourList.find(yourListing => 
        yourListing.name === compListing.name && 
        yourListing.category === compListing.category
      );
      
      if (match) {
        const priceDiff = compListing.price - match.price;
        const priceDiffPercent = ((priceDiff / compListing.price) * 100).toFixed(2);
        
        comparison.matches.push({
          name: compListing.name,
          category: compListing.category,
          competitor_price: compListing.price,
          your_price: match.price,
          price_difference: priceDiff,
          price_difference_percent: parseFloat(priceDiffPercent),
          recommendation: priceDiff > 0 ? 'lower_your_price' : 'competitor_higher'
        });
      } else {
        // Opportunity: competitor sells this but you don't
        comparison.opportunities.push({
          name: compListing.name,
          category: compListing.category,
          price: compListing.price,
          platform: compListing.platform
        });
      }
    });
    
    res.json({
      status: 'SUCCESS',
      data: comparison
    });
  } catch (err) {
    console.error('Error in competitor analytics:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 :
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

/**
 * DELETE /competitors/:id - Delete a competitor profile
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Delete from database
    // await db.competitors.deleteById(id);
    
    res.json({
      status: 'SUCCESS',
      message: `Competitor ${id} deleted`
    });
  } catch (err) {
    console.error('Error deleting competitor:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
