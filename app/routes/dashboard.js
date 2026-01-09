const router = require('express').Router();
const { getGf, CONST } = require('../services/gameflip'); // Import CONST
const { requireGf } = require('../middleware/gfCredentials');

const LISTING_STATUSES = ['draft', 'ready', 'onsale', 'sale_pending', 'sold']; // Exclude 'expired' for direct search

async function getAllListings(gf, ownerId) {
  let allListings = [];
  
  try {
    // Use listing_search with pagination
    // _getList now includes next_page in the returned data object
    let query = { owner: ownerId, v2: true, limit: 100 };
    let nextPage = null;
    let iterations = 0;
    const MAX_ITERATIONS = 100; // Safety limit

    while (iterations < MAX_ITERATIONS) {
      try {
        // Set nextPage in query for pagination
        if (nextPage) {
          query.nextPage = nextPage;
        } else {
          // Remove nextPage from query for first request
          delete query.nextPage;
        }
        
        const result = await gf.listing_search(query);
        
        // _getList returns apiData.data, which should be {listings: [...], next_page: "..."}
        // next_page is now included in the data object by _getList
        let listings = [];
        let foundNextPage = null;
        
        if (result) {
          if (Array.isArray(result)) {
            // Direct array response
            listings = result;
          } else if (result.listings && Array.isArray(result.listings)) {
            // Expected structure: {listings: [...], next_page: "..."}
            listings = result.listings;
            foundNextPage = result.next_page || null;
          } else if (typeof result === 'object') {
            // Try to find listings array in object
            for (let key in result) {
              if (Array.isArray(result[key]) && key.toLowerCase().includes('listing')) {
                listings = result[key];
                foundNextPage = result.next_page || null;
                break;
              }
            }
          }
        }
        
        // Add listings to collection
        if (listings.length > 0) {
          allListings = allListings.concat(listings);
          console.log(`[Page ${iterations + 1}] Fetched ${listings.length} listings (total: ${allListings.length}), next_page: ${foundNextPage ? 'yes' : 'no'}`);
        }
        
        // Continue pagination if we found next_page
        if (foundNextPage) {
          nextPage = foundNextPage;
          iterations++;
        } else {
          // No more pages
          console.log(`No more pages. Total listings: ${allListings.length}`);
          break;
        }
      } catch (searchErr) {
        console.error(`Error fetching page ${iterations + 1}:`, searchErr.message);
        // If we have some results, return what we have
        if (allListings.length > 0) {
          console.warn(`Returning ${allListings.length} listings despite error`);
          break;
        }
        // If no results yet, try listing_of as fallback
        try {
          console.warn('Trying listing_of as fallback');
          const fallbackListings = await gf.listing_of(ownerId);
          if (fallbackListings) {
            allListings = Array.isArray(fallbackListings) ? fallbackListings : 
                         (fallbackListings.listings || fallbackListings.data || []);
          }
        } catch (fallbackErr) {
          console.error('Fallback also failed:', fallbackErr.message);
        }
        break;
      }
    }
    
    console.log(`Total listings fetched: ${allListings.length}`);
    
  } catch (err) {
    console.error('Error in getAllListings:', err.message);
    // Final fallback
    if (allListings.length === 0) {
      try {
        const fallbackListings = await gf.listing_of(ownerId);
        allListings = Array.isArray(fallbackListings) ? fallbackListings : 
                     (fallbackListings?.listings || fallbackListings?.data || []);
      } catch (fallbackErr) {
        console.error('Final fallback failed:', fallbackErr.message);
      }
    }
  }
  
  return Array.isArray(allListings) ? allListings : [];
}

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
      console.log(`[EXCHANGES] Page ${iterations + 1}: ${exchanges.length} exchanges (total ${allExchanges.length})`);
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

function parseDateRange(query) {
  if (query.month) {
    const [year, month] = query.month.split('-').map(Number);
    if (!year || !month) {
      return null;
    }
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    return { start, end, month: query.month };
  }
  if (query.from && query.to) {
    const start = new Date(query.from);
    const end = new Date(query.to);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null;
    }
    return { start, end };
  }
  return null;
}

/**
 * GET /dashboard/summary - Get dashboard summary with accurate listing counts
 */
router.get('/summary', requireGf, async (req, res) => {
  try {
    const gf = req.gf || getGf();
    const profile = await gf.profile_get('me');
    const ownerId = profile.owner;

    const wallet = await gf.getWallet({ balance_only: true, flp: true, held: true, pending: true });
    
    // Get ALL listings for the user
    const allListings = await getAllListings(gf, ownerId);
    
    // Count listings by status
    const now = new Date();
    const counts = {
      total: allListings.length,
      draft: 0,
      ready: 0,
      onsale: 0,
      sale_pending: 0,
      sold: 0,
      expired: 0
    };
    
    allListings.forEach(listing => {
      // Check if expired first (expiration date has passed)
      if (listing.expiration && new Date(listing.expiration) < now) {
        counts.expired++;
      } else if (counts[listing.status] !== undefined) {
        counts[listing.status]++;
      }
    });
    
    // Get exchanges (sales)
    const exchanges = await getAllExchanges(gf, { owner: ownerId, role: 'seller', limit: 100 });
    
    // Calculate sales metrics for last 7 and 30 days
    // (reuse 'now' variable declared above)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const salesLast7Days = exchanges.filter(e => {
      const saleDate = new Date(e.created || e.date || e.updated);
      return saleDate >= sevenDaysAgo;
    });
    
    const salesLast30Days = exchanges.filter(e => {
      const saleDate = new Date(e.created || e.date || e.updated);
      return saleDate >= thirtyDaysAgo;
    });
    
    const range = parseDateRange(req.query);
    let monthSalesCount = 0;
    if (range) {
      monthSalesCount = exchanges.filter((exchange) => {
        const saleDate = new Date(exchange.created || exchange.date || exchange.updated);
        return saleDate >= range.start && saleDate <= range.end;
      }).length;
    }

    // Calculate KPI: % listings sold per week
    // Approximation: (sales last 7 days / total listings on sale) * 100
    const listingsOnSale = counts.onsale;
    const salesConversionRate = listingsOnSale > 0 
      ? ((salesLast7Days.length / listingsOnSale) * 100).toFixed(2)
      : 0;

    const heldBalance = wallet?.held_balance || (Array.isArray(wallet?.held) ? wallet.held.reduce((sum, item) => sum + (item.amount || 0), 0) : 0);
    res.json({
      balance_usd: wallet?.cash_balance || 0,
      balance_flp: wallet?.balance?.FLP || "0.0",
      balance_held: heldBalance,
      balance_available: (wallet?.cash_balance || 0) - heldBalance,
      listings: {
        total: counts.total,
        draft: counts.draft,
        ready: counts.ready,
        onsale: counts.onsale,
        sale_pending: counts.sale_pending,
        sold: counts.sold,
        expired: counts.expired,
        total_all: counts.total, // For backward compatibility
        onsale_count: counts.onsale // For backward compatibility
      },
      exchanges: {
        total: Array.isArray(exchanges) ? exchanges.length : 0,
        last_7_days: salesLast7Days.length,
        last_30_days: salesLast30Days.length,
        sales_conversion_rate_percent: parseFloat(salesConversionRate),
        month_sales_count: monthSalesCount
      },
      kpis: {
        sales_per_week: salesLast7Days.length,
        sales_per_month: salesLast30Days.length,
        conversion_rate: parseFloat(salesConversionRate),
        listings_on_sale: counts.onsale,
        listings_sold_total: counts.sold,
        month_sales_count: monthSalesCount
      }
    });
  } catch (err) {
    console.error('Error in dashboard summary:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 :
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

/**
 * GET /dashboard/listings - Get detailed listing breakdown by status
 */
router.get('/listings', requireGf, async (req, res) => {
  try {
    const gf = req.gf || getGf();
    const profile = await gf.profile_get('me');
    const ownerId = profile.owner;

    // Get ALL listings first (don't filter by status at API level to avoid errors)
    // We'll filter locally after fetching
    const allListings = await getAllListings(gf, ownerId);
    
    // Group by status
    const now = new Date();
    const categorizedListings = {
      all: allListings,
      draft: [],
      ready: [],
      onsale: [],
      sale_pending: [],
      sold: [],
      expired: []
    };
    
    const counts = {
      all: allListings.length,
      draft: 0,
      ready: 0,
      onsale: 0,
      sale_pending: 0,
      sold: 0,
      expired: 0
    };
    
    allListings.forEach(listing => {
      const listingStatus = listing.status || 'unknown';
      
      // Check if expired first
      if (listing.expiration && new Date(listing.expiration) < now) {
        categorizedListings.expired.push(listing);
        counts.expired++;
      } else if (categorizedListings[listingStatus]) {
        categorizedListings[listingStatus].push(listing);
        counts[listingStatus]++;
      }
    });
    
    // Handle status filter from query (local filtering, not API)
    const requestedStatus = req.query.status;
    let responseListings = {};
    
    if (requestedStatus) {
      // Support multiple statuses separated by | (e.g., status=draft|ready)
      const statuses = requestedStatus.split('|');
      statuses.forEach(status => {
        if (categorizedListings[status]) {
          responseListings[status] = categorizedListings[status];
        }
      });
    } else {
      // Return all categorized listings
      responseListings = categorizedListings;
    }
    
    res.json({
      counts: counts,
      listings: responseListings
    });
    
  } catch (err) {
    console.error('Error in dashboard listings route:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 :
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

module.exports = router;
