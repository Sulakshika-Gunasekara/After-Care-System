const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');
const cron = require('node-cron');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database initialization
const DB_PATH = path.join(__dirname, 'db', 'chamathka.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Run schema
const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
db.exec(schema);

// Make db accessible to routes
app.locals.db = db;

// Routes
const customersRouter = require('./routes/customers');
const ordersRouter = require('./routes/orders');
const productsRouter = require('./routes/products');
const remindersRouter = require('./routes/reminders');
const campaignsRouter = require('./routes/campaigns');
const loyaltyRouter = require('./routes/loyalty');
const feedbackRouter = require('./routes/feedback');
const dashboardRouter = require('./routes/dashboard');

app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/products', productsRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/loyalty', loyaltyRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/dashboard', dashboardRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Cron job: Process pending reminders every hour
const { processReminders } = require('./services/reminderEngine');
cron.schedule('0 * * * *', () => {
  console.log('⏰ Processing pending reminders...');
  processReminders(db);
});

// Start server
app.listen(PORT, () => {
  console.log(`\n💎 Chamathka Care+ Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`👥 Customers: http://localhost:${PORT}/api/customers`);
  console.log(`📦 Products:  http://localhost:${PORT}/api/products`);
  console.log(`🔔 Reminders: http://localhost:${PORT}/api/reminders\n`);
});

module.exports = app;
