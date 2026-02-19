const express = require('express');
const router = express.Router();

// GET all customers
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const { search, loyalty, tag, limit = 100, offset = 0 } = req.query;

  let query = 'SELECT * FROM customers WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }
  if (loyalty) {
    query += ' AND loyalty_level = ?';
    params.push(loyalty);
  }
  if (tag) {
    query += ' AND tags LIKE ?';
    params.push(`%${tag}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const customers = db.prepare(query).all(...params);
  const total = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;

  res.json({ customers, total });
});

// GET single customer with full details
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  // Get order history
  const orders = db.prepare(`
    SELECT o.*, GROUP_CONCAT(p.name, ', ') as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.customer_id = ?
    GROUP BY o.id
    ORDER BY o.order_date DESC
  `).all(req.params.id);

  // Get upcoming reminders
  const reminders = db.prepare(`
    SELECT * FROM reminders WHERE customer_id = ? AND status = 'pending' ORDER BY send_date ASC
  `).all(req.params.id);

  // Get message history
  const messages = db.prepare(`
    SELECT * FROM message_log WHERE customer_id = ? ORDER BY sent_at DESC LIMIT 20
  `).all(req.params.id);

  // Get feedback
  const feedbackList = db.prepare(`
    SELECT * FROM feedback WHERE customer_id = ? ORDER BY created_at DESC
  `).all(req.params.id);

  // Parse tags
  customer.tags = JSON.parse(customer.tags || '[]');

  res.json({ customer, orders, reminders, messages, feedback: feedbackList });
});

// POST create customer
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { name, phone, email, birthday, anniversary, preferred_stone, preferred_jewellery_type,
    tags, communication_preference, gifted_to } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  const result = db.prepare(`
    INSERT INTO customers (name, phone, email, birthday, anniversary, preferred_stone, 
      preferred_jewellery_type, tags, communication_preference, gifted_to)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name, phone, email || null, birthday || null, anniversary || null,
    preferred_stone || null, preferred_jewellery_type || null,
    JSON.stringify(tags || []), communication_preference || 'email', gifted_to || null
  );

  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(customer);
});

// PUT update customer
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { name, phone, email, birthday, anniversary, preferred_stone, preferred_jewellery_type,
    tags, communication_preference, gifted_to } = req.body;

  const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Customer not found' });

  db.prepare(`
    UPDATE customers SET 
      name = ?, phone = ?, email = ?, birthday = ?, anniversary = ?,
      preferred_stone = ?, preferred_jewellery_type = ?, tags = ?,
      communication_preference = ?, gifted_to = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    name || existing.name, phone || existing.phone, email ?? existing.email,
    birthday ?? existing.birthday, anniversary ?? existing.anniversary,
    preferred_stone ?? existing.preferred_stone, preferred_jewellery_type ?? existing.preferred_jewellery_type,
    tags ? JSON.stringify(tags) : existing.tags,
    communication_preference || existing.communication_preference,
    gifted_to ?? existing.gifted_to, req.params.id
  );

  const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE customer
router.delete('/:id', (req, res) => {
  const db = req.app.locals.db;
  const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Customer not found' });

  db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
  res.json({ message: 'Customer deleted' });
});

// GET customer recommendations
router.get('/:id/recommendations', (req, res) => {
  const db = req.app.locals.db;
  const { getRecommendations } = require('../services/crossSell');
  const recs = getRecommendations(db, req.params.id);
  res.json(recs);
});

module.exports = router;
