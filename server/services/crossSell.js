/**
 * Cross-Sell Recommendation Engine
 * Suggests matching jewellery based on purchase history
 */

// Recommendation rules: category → suggested complementary categories
const CATEGORY_COMPLEMENTS = {
  'Earrings':  ['Necklace', 'Ring', 'Set'],
  'Necklace':  ['Earrings', 'Bracelet', 'Set'],
  'Ring':      ['Earrings', 'Necklace', 'Bracelet'],
  'Bracelet':  ['Necklace', 'Ring', 'Set'],
  'Set':       ['Ring', 'Bracelet'],
  'Pendant':   ['Necklace', 'Earrings', 'Ring'],
  'Anklet':    ['Bracelet', 'Ring']
};

/**
 * Get recommendations for a customer based on their order history
 */
function getRecommendations(db, customerId, limit = 6) {
  // Get customer's purchased items
  const purchasedItems = db.prepare(`
    SELECT DISTINCT oi.stone_type, oi.category, p.collection, p.metal_finish, p.id as product_id
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    WHERE o.customer_id = ?
  `).all(customerId);

  if (purchasedItems.length === 0) {
    // No history — return best sellers
    return db.prepare(`
      SELECT * FROM products WHERE in_stock = 1 ORDER BY RANDOM() LIMIT ?
    `).all(limit);
  }

  const purchasedProductIds = purchasedItems.map(i => i.product_id);
  const stones = [...new Set(purchasedItems.map(i => i.stone_type).filter(Boolean))];
  const categories = [...new Set(purchasedItems.map(i => i.category).filter(Boolean))];
  const collections = [...new Set(purchasedItems.map(i => i.collection).filter(Boolean))];

  // Build suggested categories
  const suggestedCategories = new Set();
  categories.forEach(cat => {
    const complements = CATEGORY_COMPLEMENTS[cat] || [];
    complements.forEach(c => suggestedCategories.add(c));
  });

  // Remove categories customer already has
  categories.forEach(c => suggestedCategories.delete(c));

  const recommendations = [];

  // Priority 1: Same stone, complementary category
  if (stones.length > 0 && suggestedCategories.size > 0) {
    const stonePlaceholders = stones.map(() => '?').join(',');
    const catPlaceholders = [...suggestedCategories].map(() => '?').join(',');
    const idPlaceholders = purchasedProductIds.map(() => '?').join(',');
    
    const sameStoneRecs = db.prepare(`
      SELECT *, 'same_stone' as rec_reason FROM products 
      WHERE stone_type IN (${stonePlaceholders}) 
        AND category IN (${catPlaceholders})
        AND id NOT IN (${idPlaceholders})
        AND in_stock = 1
      LIMIT ?
    `).all(...stones, ...[...suggestedCategories], ...purchasedProductIds, limit);
    
    recommendations.push(...sameStoneRecs);
  }

  // Priority 2: Same collection
  if (recommendations.length < limit && collections.length > 0) {
    const collPlaceholders = collections.map(() => '?').join(',');
    const existingIds = [...purchasedProductIds, ...recommendations.map(r => r.id)];
    const idPlaceholders = existingIds.map(() => '?').join(',');

    const sameCollRecs = db.prepare(`
      SELECT *, 'same_collection' as rec_reason FROM products
      WHERE collection IN (${collPlaceholders})
        AND id NOT IN (${idPlaceholders})
        AND in_stock = 1
      LIMIT ?
    `).all(...collections, ...existingIds, limit - recommendations.length);
    
    recommendations.push(...sameCollRecs);
  }

  // Priority 3: Set completion (if customer bought singles, suggest sets)
  if (recommendations.length < limit) {
    const boughtSingles = categories.filter(c => c !== 'Set');
    if (boughtSingles.length >= 2) {
      const existingIds = [...purchasedProductIds, ...recommendations.map(r => r.id)];
      const idPlaceholders = existingIds.map(() => '?').join(',');

      const setRecs = db.prepare(`
        SELECT *, 'complete_set' as rec_reason FROM products
        WHERE category = 'Set'
          AND id NOT IN (${idPlaceholders})
          AND in_stock = 1
        LIMIT ?
      `).all(...existingIds, limit - recommendations.length);
      
      recommendations.push(...setRecs);
    }
  }

  // Fill remaining with popular items
  if (recommendations.length < limit) {
    const existingIds = [...purchasedProductIds, ...recommendations.map(r => r.id)];
    const idPlaceholders = existingIds.map(() => '?').join(',');

    const fillRecs = db.prepare(`
      SELECT *, 'popular' as rec_reason FROM products
      WHERE id NOT IN (${idPlaceholders})
        AND in_stock = 1
      ORDER BY RANDOM()
      LIMIT ?
    `).all(...existingIds, limit - recommendations.length);

    recommendations.push(...fillRecs);
  }

  return recommendations.slice(0, limit);
}

/**
 * Generate cross-sell message for a customer
 */
function generateCrossSellMessage(customer, recommendations) {
  if (recommendations.length === 0) return null;

  const recList = recommendations
    .slice(0, 3)
    .map(r => `  💎 ${r.name} — Rs. ${r.price.toLocaleString()}`)
    .join('\n');

  return {
    subject: `Complete Your Collection, ${customer.name}! 💎`,
    message: `Hi ${customer.name}!\n\nBased on your taste, we think you'll love these:\n\n${recList}\n\nVisit us or shop online to complete your look!\n\n✨ Chamathka Jewellers`
  };
}

module.exports = {
  getRecommendations,
  generateCrossSellMessage,
  CATEGORY_COMPLEMENTS
};
