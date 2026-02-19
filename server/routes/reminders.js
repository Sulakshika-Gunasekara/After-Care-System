const express = require('express');
const router = express.Router();
const { processReminders, createReminder } = require('../services/reminderEngine');

// GET all reminders
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const { status, type, customer_id, limit = 100 } = req.query;

  let query = `
    SELECT r.*, c.name as customer_name, c.phone as customer_phone
    FROM reminders r
    JOIN customers c ON r.customer_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (status) { query += ' AND r.status = ?'; params.push(status); }
  if (type) { query += ' AND r.type = ?'; params.push(type); }
  if (customer_id) { query += ' AND r.customer_id = ?'; params.push(customer_id); }

  query += ' ORDER BY r.send_date ASC LIMIT ?';
  params.push(Number(limit));

  const reminders = db.prepare(query).all(...params);
  
  // Stats
  const stats = {
    pending: db.prepare("SELECT COUNT(*) as count FROM reminders WHERE status = 'pending'").get().count,
    sent: db.prepare("SELECT COUNT(*) as count FROM reminders WHERE status = 'sent'").get().count,
    failed: db.prepare("SELECT COUNT(*) as count FROM reminders WHERE status = 'failed'").get().count,
    total: db.prepare('SELECT COUNT(*) as count FROM reminders').get().count
  };

  res.json({ reminders, stats });
});

// POST process all pending reminders now
router.post('/process', (req, res) => {
  const db = req.app.locals.db;
  const result = processReminders(db);
  res.json({ message: 'Reminders processed', ...result });
});

// POST create manual reminder
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { customer_id, type, title, message, send_date, channel } = req.body;

  if (!customer_id || !type || !message || !send_date) {
    return res.status(400).json({ error: 'customer_id, type, message, and send_date are required' });
  }

  const reminder = createReminder(db, { customer_id, type, title, message, send_date, channel });
  res.status(201).json(reminder);
});

// PUT update reminder
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { status, message, send_date } = req.body;

  db.prepare(`
    UPDATE reminders SET status = COALESCE(?, status), message = COALESCE(?, message), 
      send_date = COALESCE(?, send_date) WHERE id = ?
  `).run(status, message, send_date, req.params.id);

  const reminder = db.prepare('SELECT * FROM reminders WHERE id = ?').get(req.params.id);
  res.json(reminder);
});

// DELETE reminder
router.delete('/:id', (req, res) => {
  const db = req.app.locals.db;
  db.prepare('DELETE FROM reminders WHERE id = ?').run(req.params.id);
  res.json({ message: 'Reminder deleted' });
});

module.exports = router;
