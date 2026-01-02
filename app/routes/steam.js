const router = require('express').Router();
const { getGf } = require('../services/gameflip');

// GET /steam/escrows - Get user's escrows
router.get('/escrows', async (req, res) => {
  try {
    const gf = getGf();
    
    // Build query parameters
    const params = {};
    if (req.query.status) params.status = req.query.status;
    if (req.query.limit) params.limit = parseInt(req.query.limit);
    
    const escrows = await gf.escrow_search(params) || [];
    const escrowList = Array.isArray(escrows) ? escrows : 
                      (escrows.data || []);
    
    res.json(escrowList);
  } catch (err) {
    console.error('Error in steam escrows:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 : 
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

// GET /steam/escrows/:id - Get a single escrow by listing id
router.get('/escrows/:id', async (req, res) => {
  try {
    const gf = getGf();
    const escrow = await gf.escrow_get(req.params.id);
    res.json(escrow);
  } catch (err) {
    console.error('Error getting escrow:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 : 
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

// GET /steam/trade-ban - Check trade ban status
router.get('/trade-ban', async (req, res) => {
  try {
    const gf = getGf();
    // This endpoint returns empty object if OK, throws 422 if trade ban/hold
    const status = await gf.steam_trade_status();
    res.json({ status: 'ok', trade_ban: false, ...status });
  } catch (err) {
    console.error('Error in steam trade ban:', err);
    const errorMessage = err.message || 'Unknown error';
    // 422 means there's a trade ban/hold - return it as valid response
    if (errorMessage.includes('422') || errorMessage.includes('trade ban') || errorMessage.includes('trade hold')) {
      res.status(422).json({ 
        status: 'error', 
        trade_ban: true, 
        error: errorMessage 
      });
    } else {
      const statusCode = errorMessage.includes('404') ? 404 : 
                         errorMessage.includes('401') ? 401 :
                         errorMessage.includes('403') ? 403 : 500;
      res.status(statusCode).json({ error: errorMessage });
    }
  }
});

// GET /steam/inventory/:profileId/:appId - Get Steam inventory
router.get('/inventory/:profileId/:appId', async (req, res) => {
  try {
    const gf = getGf();
    const { profileId, appId } = req.params;
    
    const query = {};
    if (req.query.l) query.l = req.query.l;
    if (req.query.count) query.count = parseInt(req.query.count);
    if (req.query.start_assetid) query.start_assetid = req.query.start_assetid;
    
    const inventory = await gf.steam_inventory_get(profileId, appId, query);
    res.json(inventory);
  } catch (err) {
    console.error('Error getting Steam inventory:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 : 
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

module.exports = router;