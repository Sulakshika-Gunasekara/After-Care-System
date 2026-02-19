const express = require('express');
const router = express.Router();

// GET dashboard stats
router.get('/stats', (req, res) => {
  const db = req.app.locals.db;

  // Core metrics
  const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
  const totalRevenue = db.prepare('SELECT COALESCE(SUM(total_amount), 0) as sum FROM orders').get().sum;
  const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  const pendingReminders = db.prepare("SELECT COUNT(*) as count FROM reminders WHERE status = 'pending'").get().count;
  const messagesSent = db.prepare('SELECT COUNT(*) as count FROM message_log').get().count;

  // This month metrics
  const thisMonth = new Date().toISOString().substring(0, 7);
  const monthlyOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE substr(order_date, 1, 7) = ?").get(thisMonth).count;
  const monthlyRevenue = db.prepare("SELECT COALESCE(SUM(total_amount), 0) as sum FROM orders WHERE substr(order_date, 1, 7) = ?").get(thisMonth).sum;
  const newCustomers = db.prepare("SELECT COUNT(*) as count FROM customers WHERE substr(created_at, 1, 7) = ?").get(thisMonth).count;

  // Loyalty distribution
  const loyaltyDist = db.prepare(`
    SELECT loyalty_level, COUNT(*) as count 
    FROM customers GROUP BY loyalty_level
  `).all();

  // Top stones
  const topStones = db.prepare(`
    SELECT stone_type, COUNT(*) as count 
    FROM order_items WHERE stone_type IS NOT NULL
    GROUP BY stone_type ORDER BY count DESC LIMIT 5
  `).all();

  // Top categories
  const topCategories = db.prepare(`
    SELECT category, COUNT(*) as count
    FROM order_items WHERE category IS NOT NULL
    GROUP BY category ORDER BY count DESC LIMIT 5
  `).all();

  // Recent orders
  const recentOrders = db.prepare(`
    SELECT o.*, c.name as customer_name
    FROM orders o JOIN customers c ON o.customer_id = c.id
    ORDER BY o.order_date DESC LIMIT 10
  `).all();

  // Upcoming reminders
  const upcomingReminders = db.prepare(`
    SELECT r.*, c.name as customer_name
    FROM reminders r JOIN customers c ON r.customer_id = c.id
    WHERE r.status = 'pending'
    ORDER BY r.send_date ASC LIMIT 10
  `).all();

  // Feedback average
  const avgFeedback = db.prepare(`
    SELECT 
      ROUND(AVG(satisfaction), 1) as satisfaction,
      ROUND(AVG(stone_quality), 1) as stone_quality,
      ROUND(AVG(packaging), 1) as packaging,
      ROUND(AVG(delivery), 1) as delivery
    FROM feedback
  `).get();

  // Active campaigns
  const activeCampaigns = db.prepare("SELECT * FROM campaigns WHERE status IN ('draft', 'scheduled') ORDER BY scheduled_date ASC LIMIT 5").all();

  // Monthly revenue trend (last 6 months)
  const revenueTrend = db.prepare(`
    SELECT substr(order_date, 1, 7) as month, 
      SUM(total_amount) as revenue, COUNT(*) as orders
    FROM orders
    GROUP BY substr(order_date, 1, 7)
    ORDER BY month DESC LIMIT 6
  `).all().reverse();

  res.json({
    overview: {
      totalCustomers, totalOrders, totalRevenue, totalProducts,
      pendingReminders, messagesSent
    },
    monthly: { orders: monthlyOrders, revenue: monthlyRevenue, newCustomers },
    loyaltyDistribution: loyaltyDist,
    topStones, topCategories,
    recentOrders, upcomingReminders,
    avgFeedback, activeCampaigns, revenueTrend
  });
});

module.exports = router;
