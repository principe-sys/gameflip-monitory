const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const { requireGf } = require('../middleware/gfCredentials');
const { listAccounts } = require('../services/accountStore');

const router = express.Router();

function normalizeMonthParam(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function getAllExchanges(gf, params = {}) {
  let allExchanges = [];
  let nextPage = null;
  let iterations = 0;
  const MAX_ITERATIONS = 50;

  while (iterations < MAX_ITERATIONS) {
    const query = { ...params };
    if (nextPage) {
      query.nextPage = nextPage;
    }
    const result = await gf.exchange_search(query);
    const exchanges = Array.isArray(result) ? result : result?.exchanges || result?.data || [];
    const foundNextPage = result?.next_page || null;

    if (exchanges.length > 0) {
      allExchanges = allExchanges.concat(exchanges);
    }

    if (foundNextPage) {
      nextPage = foundNextPage;
      iterations += 1;
    } else {
      break;
    }
  }

  return { exchanges: allExchanges, pages: iterations + 1 };
}

router.get('/status', requireAuth, requireGf, async (req, res) => {
  const accounts = await listAccounts(req.session.userId);
  const activeAccount = accounts.find((item) => item.id === req.session.activeAccountId);
  const months = normalizeMonthParam(req.query.months || req.query.month);
  let walletCounts = {};
  let exchangeCounts = {};
  let pagination = {};

  if (req.gf && months.length > 0) {
    const profile = await req.gf.profile_get('me');
    const owner = profile.owner;
    for (const yearMonth of months) {
      const wallet = await req.gf.wallet_get(owner, { year_month: yearMonth, balance_only: false, held: true, pending: true });
      walletCounts[yearMonth] = Array.isArray(wallet?.history) ? wallet.history.length : 0;
    }

    const { exchanges, pages } = await getAllExchanges(req.gf, { owner, role: 'seller', limit: 100 });
    exchangeCounts = months.reduce((acc, yearMonth) => {
      const [year, month] = yearMonth.split('-').map(Number);
      if (!year || !month) return acc;
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
      acc[yearMonth] = exchanges.filter((exchange) => {
        const saleDate = new Date(exchange.created || exchange.date || exchange.updated);
        return saleDate >= start && saleDate <= end;
      }).length;
      return acc;
    }, {});
    pagination = { exchangesPages: pages };
  }

  res.json({
    userId: req.session.userId,
    activeAccount: activeAccount
      ? { id: activeAccount.id, name: activeAccount.name, apiKey: activeAccount.apiKey }
      : null,
    hasSession: !!req.session.userId,
    credentialSource: req.gfCredentials?.source || null,
    monthCounts: {
      wallet: walletCounts,
      exchanges: exchangeCounts
    },
    pagination
  });
});

module.exports = router;
