const express = require('express');
const router = express.Router();
const { requireGf } = require('../middleware/gfCredentials');

function normalizeMonthParam(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function fetchWalletHistory(gf, owner, yearMonth) {
  const wallet = await gf.wallet_get(owner, {
    year_month: yearMonth,
    pending: true,
    held: true,
    balance_only: false,
    flp: true,
    limit: 100
  });

  const history = Array.isArray(wallet?.history) ? wallet.history : [];
  let nextPage = wallet?.next_page || null;
  let iterations = 0;
  const MAX_ITERATIONS = 50;

  while (nextPage && iterations < MAX_ITERATIONS) {
    const page = await gf._getList(`account/${owner}/wallet_history`, { nextPage });
    const pageHistory = Array.isArray(page?.history) ? page.history : [];
    history.push(...pageHistory);
    nextPage = page?.next_page || null;
    iterations += 1;
  }

  console.log(`[WALLET] ${yearMonth} history count: ${history.length}, pages: ${iterations + 1}`);

  return { wallet, history };
}

router.get('/', requireGf, async (req, res) => {
  try {
        const gf = req.gf;
        const profile = await gf.profile_get('me');
        const owner = profile.owner;

        const months = normalizeMonthParam(req.query.months || req.query.month);
        const monthResults = {};
        let totalTransactions = 0;
        let latestWallet = null;

        if (months.length > 0) {
          for (const yearMonth of months) {
            const { wallet, history } = await fetchWalletHistory(gf, owner, yearMonth);
            latestWallet = wallet;
            monthResults[yearMonth] = history;
            totalTransactions += history.length;
          }
        }

        if (!latestWallet) {
          latestWallet = await gf.wallet_get(owner, { balance_only: true, flp: true, held: true, pending: true });
        }

        res.json({
          balance: latestWallet,
          history: monthResults,
          metadata: {
            monthCounts: Object.fromEntries(
              Object.entries(monthResults).map(([key, value]) => [key, value.length])
            ),
            totalTransactions
          }
        });
    } catch(err) {
        console.error('[WALLET] Error:', err);
        res.status(500).json({ 
            error: err.message,
            details: err.stack 
        });
    }
});

module.exports = router;
