const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'gfapi',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
