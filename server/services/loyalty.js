/**
 * Loyalty Tier Service
 * Calculates and manages customer loyalty levels
 */

const TIERS = {
  NONE:           { name: 'None', min: 0, icon: '⚪', benefits: [] },
  SILVER:         { name: 'Silver Member', min: 3, icon: '🥉', benefits: ['Free silver cleaning', '5% discount on next purchase'] },
  RUBY:           { name: 'Ruby Member', min: 6, icon: '🥈', benefits: ['Free cleaning & polishing', '10% discount', 'Early access to new collections'] },
  SAPPHIRE_ELITE: { name: 'Sapphire Elite', min: 10, icon: '🥇', benefits: ['Free maintenance for life', '15% discount', 'Private collection previews', 'Exclusive VIP sets', 'Priority customer support'] }
};

/**
 * Calculate tier based on purchase count
 */
function calculateTier(totalPurchases) {
  if (totalPurchases >= TIERS.SAPPHIRE_ELITE.min) return TIERS.SAPPHIRE_ELITE;
  if (totalPurchases >= TIERS.RUBY.min) return TIERS.RUBY;
  if (totalPurchases >= TIERS.SILVER.min) return TIERS.SILVER;
  return TIERS.NONE;
}

/**
 * Update customer loyalty tier
 */
function updateCustomerTier(db, customerId) {
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);
  if (!customer) return null;

  const newTier = calculateTier(customer.total_purchases);
  const oldTierName = customer.loyalty_level;

  if (newTier.name !== oldTierName) {
    // Update customer
    db.prepare('UPDATE customers SET loyalty_level = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(newTier.name, customerId);

    // Log tier change
    db.prepare(`
      INSERT INTO loyalty_history (customer_id, previous_tier, new_tier, reason)
      VALUES (?, ?, ?, ?)
    `).run(customerId, oldTierName, newTier.name, `Reached ${customer.total_purchases} purchases`);

    return { changed: true, previous: oldTierName, current: newTier.name, tier: newTier };
  }

  return { changed: false, current: newTier.name, tier: newTier };
}

/**
 * Get tier summary for dashboard
 */
function getTierSummary(db) {
  const tiers = db.prepare(`
    SELECT loyalty_level, COUNT(*) as count 
    FROM customers 
    GROUP BY loyalty_level
  `).all();

  return {
    tiers: Object.values(TIERS).map(t => ({
      ...t,
      count: tiers.find(r => r.loyalty_level === t.name)?.count || 0
    })),
    total: tiers.reduce((sum, t) => sum + t.count, 0)
  };
}

/**
 * Get customers near next tier upgrade
 */
function getUpcomingUpgrades(db, limit = 10) {
  const thresholds = [
    { tier: 'Silver Member', min: TIERS.SILVER.min },
    { tier: 'Ruby Member', min: TIERS.RUBY.min },
    { tier: 'Sapphire Elite', min: TIERS.SAPPHIRE_ELITE.min }
  ];

  const nearUpgrade = [];

  for (const threshold of thresholds) {
    const customers = db.prepare(`
      SELECT *, (? - total_purchases) as purchases_needed
      FROM customers 
      WHERE total_purchases < ? AND total_purchases >= ? - 2
      ORDER BY total_purchases DESC
      LIMIT ?
    `).all(threshold.min, threshold.min, threshold.min, limit);

    customers.forEach(c => {
      nearUpgrade.push({
        ...c,
        next_tier: threshold.tier,
        purchases_needed: threshold.min - c.total_purchases
      });
    });
  }

  return nearUpgrade.sort((a, b) => a.purchases_needed - b.purchases_needed).slice(0, limit);
}

module.exports = {
  TIERS,
  calculateTier,
  updateCustomerTier,
  getTierSummary,
  getUpcomingUpgrades
};
