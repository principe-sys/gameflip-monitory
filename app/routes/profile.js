'use strict';

const express = require('express');
const router = express.Router();
const { getGf } = require('../services/gameflip');
const { requireGf } = require('../middleware/gfCredentials');

// GET /profile
router.get('/', requireGf, async (req, res) => {
  try {
    const gf = req.gf || getGf();
    const profileId = req.query.id || 'me';
    const profile = await gf.profile_get(profileId);
    res.json(profile);
  } catch (err) {
    console.error('Error in profile route:', err);
    const errorMessage = err.message || 'Unknown error';
    const statusCode = errorMessage.includes('404') ? 404 : 
                       errorMessage.includes('401') ? 401 :
                       errorMessage.includes('403') ? 403 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

module.exports = router;
