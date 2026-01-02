'use strict';

const express = require('express');
const router = express.Router();
const { getGf } = require('../services/gameflip');

/**
 * Helper function to get all listings with pagination
 */
async function getAllListings(gf, ownerId) {
  let allListings = [];
  let query = { owner: ownerId, v2: true, limit: 100 };
  let nextPage = null;
  let iterations = 0;
  const MAX_ITERATIONS = 100;

  while (iterations < MAX_ITERATIONS) {
    try {
      if (nextPage) {
        query.nextPage = nextPage;
      } else {
        delete query.nextPage;
      }
      
      const result = await gf.listing_search(query);
      
      let listings = [];
      let foundNextPage = null;
      
      if (result) {
        if (Array.isArray(result)) {
          listings = result;
        } else if (result.listings && Array.isArray(result.listings)) {
          listings = result.listings;
          foundNextPage = result.next_page || null;
        }
      }
      
      if (listings.length > 0) {
        allListings = allListings.concat(listings);
      }
      
      if (foundNextPage) {
        nextPage = foundNextPage;
        iterations++;
      } else {
        break;
      }
    } catch (err) {
      console.error(`Error fetching listings page ${iterations + 1}:`, err.message);
      break;
    }
  }
  
  return allListings;
}

/**
 * GET /analytics/overview - Get analytics overview
 */
router.get('/overview', async (req, res) => {
  try {
    const gf = getGf();
    const profile = await gf.profile_get('me');
    const ownerId = profile.owner;
    
    // Get all listings
    const allListings = await getAllListings(gf, ownerId);
    
    // Get exchanges (sales)
    const exchanges = await gf.exchange_search({ role: 'seller', owner: ownerId }) || {};
    const exchangeList = Array.isArray(exchanges) ? exchanges :
                        (exchanges.exchanges || exchanges.data || []);
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Calculate metrics
    const metrics = {
      listings: {
        total: allListings.length,
        onsale: allListings.filter(l => l.status === 'onsale').length,
        draft: allListings.filter(l => l.status === 'draft').length,
        sold: allListings.filter(l => l.status === 'sold').length,
        expired: allListings.filter(l => {
          if (!l.expiration) return false;
          return new Date(l.expiration) < now && (l.status === 'onsale' || l.status === 'ready');
        }).length
      },
      sales: {
        total: exchangeList.length,
        last_7_days: exchangeList.filter(e => new Date(e.created || e.date) >= sevenDaysAgo).length,
        last_30_days: exchangeList.filter(e => new Date(e.created || e.date) >= thirtyDaysAgo).length,
        total_revenue: exchangeList.reduce((sum, e) => sum + (e.price || 0), 0)
      },
      listings_performance: {
        not_selling: allListings.filter(l => {
          if (l.status !== 'onsale') return false;
          const created = new Date(l.created || l.created_at);
          const daysActive = (now - created) / (1000 * 60 * 60 * 24);
          return daysActive > 7;
        }).length,
        average_price: allListings.length > 0 
          ? allListings.reduce((sum, l) => sum + (l.price || 0), 0) / allListings.length 
          : 0
      }
    };
    
    res.json({
      status: 'SUCCESS',
      data: metrics
    });
  } catch (err) {
    console.error('Error in analytics overview:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /analytics/listings - Get detailed listing analytics
 */
router.get('/listings', async (req, res) => {
  try {
    const gf = getGf();
    const profile = await gf.profile_get('me');
    const ownerId = profile.owner;
    
    const allListings = await getAllListings(gf, ownerId);
    const now = new Date();
    
    // Analyze each listing
    const listingAnalytics = allListings.map(listing => {
      const created = new Date(listing.created || listing.created_at);
      const daysActive = (now - created) / (1000 * 60 * 60 * 24);
      const isExpired = listing.expiration && new Date(listing.expiration) < now;
      
      return {
        id: listing.id,
        name: listing.name,
        category: listing.category,
        status: listing.status,
        price: listing.price,
        created: listing.created,
        days_active: Math.floor(daysActive),
        is_expired: isExpired,
        has_not_sold: listing.status === 'onsale' && daysActive > 7,
        performance_score: listing.status === 'sold' ? 100 : 
                          (listing.status === 'onsale' ? 50 : 0)
      };
    });
    
    // Sort by performance (worst performers first)
    listingAnalytics.sort((a, b) => {
      if (a.has_not_sold && !b.has_not_sold) return -1;
      if (!a.has_not_sold && b.has_not_sold) return 1;
      return b.days_active - a.days_active;
    });
    
    res.json({
      status: 'SUCCESS',
      data: {
        listings: listingAnalytics,
        count: listingAnalytics.length
      }
    });
  } catch (err) {
    console.error('Error in listing analytics:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /analytics/sales - Get sales analytics
 */
router.get('/sales', async (req, res) => {
  try {
    const gf = getGf();
    const profile = await gf.profile_get('me');
    const ownerId = profile.owner;
    
    const exchanges = await gf.exchange_search({ role: 'seller', owner: ownerId }) || {};
    const exchangeList = Array.isArray(exchanges) ? exchanges :
                        (exchanges.exchanges || exchanges.data || []);
    
    const now = new Date();
    
    // Group sales by day for the last 30 days
    const salesByDay = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      salesByDay[dateKey] = { date: dateKey, count: 0, revenue: 0 };
    }
    
    exchangeList.forEach(exchange => {
      const date = new Date(exchange.created || exchange.date || exchange.updated);
      const dateKey = date.toISOString().split('T')[0];
      if (salesByDay[dateKey]) {
        salesByDay[dateKey].count++;
        salesByDay[dateKey].revenue += exchange.price || 0;
      }
    });
    
    const salesTrend = Object.values(salesByDay).reverse();
    
    res.json({
      status: 'SUCCESS',
      data: {
        total_sales: exchangeList.length,
        total_revenue: exchangeList.reduce((sum, e) => sum + (e.price || 0), 0),
        sales_trend: salesTrend,
        average_sale_price: exchangeList.length > 0
          ? exchangeList.reduce((sum, e) => sum + (e.price || 0), 0) / exchangeList.length
          : 0
      }
    });
  } catch (err) {
    console.error('Error in sales analytics:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /analytics/alerts - Get alerts for listings that need attention
 */
router.get('/alerts', async (req, res) => {
  try {
    const gf = getGf();
    const profile = await gf.profile_get('me');
    const ownerId = profile.owner;
    
    const allListings = await getAllListings(gf, ownerId);
    const now = new Date();
    
    const alerts = [];
    
    // Check for listings that haven't sold in a while
    allListings.forEach(listing => {
      if (listing.status === 'onsale') {
        const created = new Date(listing.created || listing.created_at);
        const daysActive = (now - created) / (1000 * 60 * 60 * 24);
        
        if (daysActive > 14) {
          alerts.push({
            type: 'not_selling',
            severity: 'medium',
            listing_id: listing.id,
            listing_name: listing.name,
            message: `Listing has been active for ${Math.floor(daysActive)} days without selling`,
            days_active: Math.floor(daysActive),
            recommendation: 'Consider lowering price or updating listing'
          });
        }
      }
      
      // Check for expired listings
      if (listing.expiration && new Date(listing.expiration) < now && 
          (listing.status === 'onsale' || listing.status === 'ready')) {
        alerts.push({
          type: 'expired',
          severity: 'high',
          listing_id: listing.id,
          listing_name: listing.name,
          message: 'Listing has expired',
          recommendation: 'Republish or update listing'
        });
      }
    });
    
    res.json({
      status: 'SUCCESS',
      data: {
        alerts: alerts,
        count: alerts.length,
        high_priority: alerts.filter(a => a.severity === 'high').length,
        medium_priority: alerts.filter(a => a.severity === 'medium').length
      }
    });
  } catch (err) {
    console.error('Error in alerts:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

