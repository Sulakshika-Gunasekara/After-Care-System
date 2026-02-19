const express = require('express');
const router = express.Router();

// GET all campaigns
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const { status, type } = req.query;

  let query = 'SELECT * FROM campaigns WHERE 1=1';
  const params = [];

  if (status) { query += ' AND status = ?'; params.push(status); }
  if (type) { query += ' AND type = ?'; params.push(type); }

  query += ' ORDER BY scheduled_date DESC';
  const campaigns = db.prepare(query).all(...params);

  res.json({ campaigns });
});

// GET single campaign with target audience count
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  // Calculate target audience
  const targetTags = JSON.parse(campaign.target_tags || '[]');
  let audienceCount = 0;
  if (targetTags.length > 0) {
    const conditions = targetTags.map(t => `tags LIKE '%${t}%'`).join(' OR ');
    audienceCount = db.prepare(`SELECT COUNT(*) as count FROM customers WHERE ${conditions}`).get().count;
  } else {
    audienceCount = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
  }

  res.json({ campaign, audienceCount });
});

// POST create campaign
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { name, type, target_tags, message_template, subject, scheduled_date } = req.body;

  if (!name || !type || !message_template) {
    return res.status(400).json({ error: 'Name, type, and message_template are required' });
  }

  const result = db.prepare(`
    INSERT INTO campaigns (name, type, target_tags, message_template, subject, scheduled_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name, type, JSON.stringify(target_tags || []), message_template, subject || '', scheduled_date || null);

  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(campaign);
});

// POST send campaign (execute it)
router.post('/:id/send', (req, res) => {
  const db = req.app.locals.db;
  const { sendMessage } = require('../services/messaging');

  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  const targetTags = JSON.parse(campaign.target_tags || '[]');
  let customers;
  if (targetTags.length > 0) {
    const conditions = targetTags.map(t => `tags LIKE '%${t}%'`).join(' OR ');
    customers = db.prepare(`SELECT * FROM customers WHERE ${conditions}`).all();
  } else {
    customers = db.prepare('SELECT * FROM customers').all();
  }

  let sentCount = 0;
  for (const customer of customers) {
    const personalizedMessage = campaign.message_template
      .replace(/{name}/g, customer.name)
      .replace(/{preferred_stone}/g, customer.preferred_stone || 'gemstone');
    
    sendMessage(db, customer.id, campaign.subject || campaign.name, personalizedMessage);
    sentCount++;
  }

  db.prepare("UPDATE campaigns SET status = 'sent', sent_count = ? WHERE id = ?")
    .run(sentCount, req.params.id);

  res.json({ message: 'Campaign sent', sentCount });
});

// PUT update campaign
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { name, type, target_tags, message_template, subject, scheduled_date, status } = req.body;

  db.prepare(`
    UPDATE campaigns SET 
      name = COALESCE(?, name), type = COALESCE(?, type),
      target_tags = COALESCE(?, target_tags), message_template = COALESCE(?, message_template),
      subject = COALESCE(?, subject), scheduled_date = COALESCE(?, scheduled_date),
      status = COALESCE(?, status)
    WHERE id = ?
  `).run(name, type, target_tags ? JSON.stringify(target_tags) : null, message_template, subject, scheduled_date, status, req.params.id);

  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id);
  res.json(campaign);
});

// DELETE campaign
router.delete('/:id', (req, res) => {
  const db = req.app.locals.db;
  db.prepare('DELETE FROM campaigns WHERE id = ?').run(req.params.id);
  res.json({ message: 'Campaign deleted' });
});

module.exports = router;
