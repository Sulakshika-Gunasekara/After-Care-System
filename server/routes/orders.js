const express = require('express');
const router = express.Router();
const { scheduleAftercare } = require('../services/reminderEngine');
const { updateCustomerTier } = require('../services/loyalty');

// GET all orders
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const { customer_id, status, channel, limit = 100, offset = 0 } = req.query;

  let query = `
    SELECT o.*, c.name as customer_name, c.phone as customer_phone,
      GROUP_CONCAT(p.name, ', ') as item_names
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE 1=1
  `;
  const params = [];

  if (customer_id) { query += ' AND o.customer_id = ?'; params.push(customer_id); }
  if (status) { query += ' AND o.status = ?'; params.push(status); }
  if (channel) { query += ' AND o.channel = ?'; params.push(channel); }

  query += ' GROUP BY o.id ORDER BY o.order_date DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const orders = db.prepare(query).all(...params);
  const total = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;

  res.json({ orders, total });
});

// GET single order
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const order = db.prepare(`
    SELECT o.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.id = ?
  `).get(req.params.id);

  if (!order) return res.status(404).json({ error: 'Order not found' });

  const items = db.prepare(`
    SELECT oi.*, p.name as product_name, p.stone_type as product_stone, 
      p.collection as product_collection, p.image_url
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `).all(req.params.id);

  res.json({ order, items });
});

// POST create order (triggers aftercare automation)
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { customer_id, items, occasion, gift_for, channel, notes } = req.body;

  if (!customer_id || !items || items.length === 0) {
    return res.status(400).json({ error: 'customer_id and at least one item are required' });
  }

  // Verify customer exists
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customer_id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  // Calculate total
  let totalAmount = 0;
  const resolvedItems = [];
  for (const item of items) {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
    if (!product) return res.status(404).json({ error: `Product #${item.product_id} not found` });
    const qty = item.quantity || 1;
    totalAmount += product.price * qty;
    resolvedItems.push({ ...item, product, quantity: qty, unit_price: product.price });
  }

  // Create order
  const orderResult = db.prepare(`
    INSERT INTO orders (customer_id, occasion, gift_for, total_amount, channel, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(customer_id, occasion || null, gift_for || null, totalAmount, channel || 'offline', notes || null);

  const orderId = orderResult.lastInsertRowid;

  // Create order items
  for (const item of resolvedItems) {
    db.prepare(`
      INSERT INTO order_items (order_id, product_id, stone_type, category, quantity, unit_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(orderId, item.product_id, item.product.stone_type, item.product.category, item.quantity, item.unit_price);
  }

  // Update customer stats
  db.prepare(`
    UPDATE customers SET 
      total_purchases = total_purchases + 1,
      total_spent = total_spent + ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(totalAmount, customer_id);

  // Update tags based on occasion/gift
  if (occasion || gift_for) {
    const existingTags = JSON.parse(customer.tags || '[]');
    if (gift_for && !existingTags.includes('Gift Buyer')) existingTags.push('Gift Buyer');
    if (occasion === "Valentine's" && !existingTags.includes('Valentine Customer')) existingTags.push('Valentine Customer');
    if (occasion === 'Birthday' && !existingTags.includes('Birthday Shopper')) existingTags.push('Birthday Shopper');
    if (occasion === 'Anniversary' && !existingTags.includes('Anniversary Shopper')) existingTags.push('Anniversary Shopper');
    if (occasion === 'Wedding' && !existingTags.includes('Wedding Shopper')) existingTags.push('Wedding Shopper');
    if (gift_for && (occasion === "Valentine's" || occasion === 'Anniversary')) {
      if (!existingTags.includes('Romantic Buyer')) existingTags.push('Romantic Buyer');
    }
    db.prepare('UPDATE customers SET tags = ? WHERE id = ?').run(JSON.stringify(existingTags), customer_id);
  }

  // Update loyalty tier
  const tierUpdate = updateCustomerTier(db, customer_id);

  // Schedule aftercare reminders
  const reminders = scheduleAftercare(db, orderId);

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);

  res.status(201).json({
    order,
    items: resolvedItems.map(i => ({ product_id: i.product_id, name: i.product.name, quantity: i.quantity, price: i.unit_price })),
    automation: {
      welcome_sent: true,
      reminders_scheduled: reminders.length,
      loyalty_update: tierUpdate
    }
  });
});

// PUT update order status
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { status, notes } = req.body;

  db.prepare('UPDATE orders SET status = ?, notes = ? WHERE id = ?')
    .run(status, notes, req.params.id);

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  res.json(order);
});

// DELETE order
router.delete('/:id', (req, res) => {
  const db = req.app.locals.db;
  db.prepare('DELETE FROM order_items WHERE order_id = ?').run(req.params.id);
  db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
  res.json({ message: 'Order deleted' });
});

module.exports = router;
