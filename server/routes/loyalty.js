const express = require('express');
const router = express.Router();
const { getTierSummary, getUpcomingUpgrades, updateCustomerTier } = require('../services/loyalty');

// GET loyalty overview
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const summary = getTierSummary(db);
  const upcomingUpgrades = getUpcomingUpgrades(db);

  res.json({ ...summary, upcomingUpgrades });
});

// GET loyalty history
router.get('/history', (req, res) => {
  const db = req.app.locals.db;
  const history = db.prepare(`
    SELECT lh.*, c.name as customer_name
    FROM loyalty_history lh
    JOIN customers c ON lh.customer_id = c.id
    ORDER BY lh.changed_at DESC
    LIMIT 50
  `).all();

  res.json({ history });
});

// GET customer loyalty details
router.get('/customer/:id', (req, res) => {
  const db = req.app.locals.db;
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  const { calculateTier, TIERS } = require('../services/loyalty');
  const currentTier = calculateTier(customer.total_purchases);

  // Find next tier
  let nextTier = null;
  let purchasesNeeded = 0;
  if (customer.total_purchases < TIERS.SAPPHIRE_ELITE.min) {
    if (customer.total_purchases < TIERS.SILVER.min) {
      nextTier = TIERS.SILVER;
      purchasesNeeded = TIERS.SILVER.min - customer.total_purchases;
    } else if (customer.total_purchases < TIERS.RUBY.min) {
      nextTier = TIERS.RUBY;
      purchasesNeeded = TIERS.RUBY.min - customer.total_purchases;
    } else {
      nextTier = TIERS.SAPPHIRE_ELITE;
      purchasesNeeded = TIERS.SAPPHIRE_ELITE.min - customer.total_purchases;
    }
  }

  const history = db.prepare(`
    SELECT * FROM loyalty_history WHERE customer_id = ? ORDER BY changed_at DESC
  `).all(req.params.id);

  res.json({
    customer_name: customer.name,
    total_purchases: customer.total_purchases,
    total_spent: customer.total_spent,
    current_tier: currentTier,
    next_tier: nextTier,
    purchases_needed: purchasesNeeded,
    history
  });
});

// POST recalculate tier
router.post('/recalculate/:id', (req, res) => {
  const db = req.app.locals.db;
  const result = updateCustomerTier(db, req.params.id);
  res.json(result);
});

module.exports = router;
