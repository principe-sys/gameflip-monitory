const express = require('express');
const crypto = require('crypto');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.post('/login', (req, res) => {
  if (!req.session.userId) {
    req.session.userId = crypto.randomUUID();
  }
  res.json({ ok: true, userId: req.session.userId });
});

router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

module.exports = router;
