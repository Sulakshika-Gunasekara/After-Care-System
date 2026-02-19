const express = require('express');
const router = express.Router();

// GET all feedback
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const { customer_id, limit = 100 } = req.query;

  let query = `
    SELECT f.*, c.name as customer_name, c.phone as customer_phone
    FROM feedback f
    JOIN customers c ON f.customer_id = c.id
    WHERE 1=1
  `;
  const params = [];
  if (customer_id) { query += ' AND f.customer_id = ?'; params.push(customer_id); }
  query += ' ORDER BY f.created_at DESC LIMIT ?';
  params.push(Number(limit));

  const feedbackList = db.prepare(query).all(...params);

  // Stats
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      ROUND(AVG(satisfaction), 1) as avg_satisfaction,
      ROUND(AVG(stone_quality), 1) as avg_stone_quality,
      ROUND(AVG(packaging), 1) as avg_packaging,
      ROUND(AVG(delivery), 1) as avg_delivery
    FROM feedback
  `).get();

  res.json({ feedback: feedbackList, stats });
});

// POST submit feedback
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { customer_id, order_id, satisfaction, stone_quality, packaging, delivery, comments } = req.body;

  if (!customer_id) return res.status(400).json({ error: 'customer_id is required' });

  // Generate discount code
  const discountCode = `THANKS${customer_id}${Date.now().toString(36).toUpperCase()}`;

  const result = db.prepare(`
    INSERT INTO feedback (customer_id, order_id, satisfaction, stone_quality, packaging, delivery, comments, discount_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(customer_id, order_id || null, satisfaction, stone_quality, packaging, delivery, comments || null, discountCode);

  // Send thank you with discount code
  const { sendMessage } = require('../services/messaging');
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customer_id);
  if (customer) {
    sendMessage(db, customer_id,
      'Thank you for your feedback! 💎',
      `Hi ${customer.name}!\n\nThank you for taking the time to share your feedback. It means a lot to us!\n\nAs a token of appreciation, here's your exclusive 5% discount code:\n🎁 ${discountCode}\n\nUse it on your next purchase!\n\nChamathka Jewellers 💎`
    );
  }

  const feedback = db.prepare('SELECT * FROM feedback WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ feedback, discountCode });
});

// DELETE feedback
router.delete('/:id', (req, res) => {
  const db = req.app.locals.db;
  db.prepare('DELETE FROM feedback WHERE id = ?').run(req.params.id);
  res.json({ message: 'Feedback deleted' });
});

module.exports = router;
