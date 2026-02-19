/**
 * Reminder Engine Service
 * Manages the full automated aftercare flow:
 * Purchase → Thank You → Care Guide → 7-Day Review → 1-Month Cleaning →
 * 3-Month Maintenance → 6-Month Cross-Sell → Seasonal → Birthday
 */

const { sendMessage, sendWelcomeMessage } = require('./messaging');
const { getRecommendations, generateCrossSellMessage } = require('./crossSell');
const { generateBirthstoneOffer, getCustomersWithBirthdayThisMonth } = require('./birthstone');

/**
 * Schedule all aftercare reminders for a new order
 */
function scheduleAftercare(db, orderId) {
  const order = db.prepare(`
    SELECT o.*, c.name as customer_name, c.communication_preference
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.id = ?
  `).get(orderId);

  if (!order) return [];

  const orderDate = new Date(order.order_date);
  const reminders = [];

  // Get stone types from order items
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
  const stoneTypes = [...new Set(items.map(i => i.stone_type).filter(Boolean))];
  const stoneLabel = stoneTypes.join(', ') || 'silver';

  // 1. Immediate: Send welcome + care guide
  sendWelcomeMessage(db, order.customer_id, stoneTypes[0]);

  // 2. 7 days: Review request
  const reviewDate = addDays(orderDate, 7);
  reminders.push(createReminder(db, {
    customer_id: order.customer_id,
    order_id: orderId,
    type: 'review_request',
    title: 'Feedback Request',
    message: `Hi ${order.customer_name}! 💎\n\nIt's been a week since your purchase. We'd love to hear about your experience!\n\nShare your feedback and get 5% OFF your next purchase.\n\n⭐ Rate us now!\n\nChamathka Jewellers`,
    send_date: reviewDate,
    channel: order.communication_preference || 'email'
  }));

  // 3. 1 month: Free cleaning offer
  const oneMonthDate = addDays(orderDate, 30);
  reminders.push(createReminder(db, {
    customer_id: order.customer_id,
    order_id: orderId,
    type: 'cleaning_reminder',
    title: '1-Month Free Cleaning',
    message: `Hi ${order.customer_name}! 💎\n\nIt's been 1 month since your ${stoneLabel} purchase.\n\nWould you like a FREE professional silver cleaning? Visit us this week!\n\n✨ Keep your jewellery sparkling.\n\nChamathka Jewellers`,
    send_date: oneMonthDate,
    channel: order.communication_preference || 'email'
  }));

  // 4. 3 months: Maintenance service
  const threeMonthDate = addDays(orderDate, 90);
  reminders.push(createReminder(db, {
    customer_id: order.customer_id,
    order_id: orderId,
    type: 'maintenance_reminder',
    title: '3-Month Maintenance',
    message: `Hi ${order.customer_name}! 💎\n\nIt's been 3 months! Time for a jewellery check-up.\n\nWe offer:\n• Professional polishing\n• Stone setting check\n• Clasp tightening\n• Deep cleaning\n\nBook your maintenance visit today!\n\nChamathka Jewellers`,
    send_date: threeMonthDate,
    channel: order.communication_preference || 'email'
  }));

  // 5. 5 months: Tarnish alert
  const fiveMonthDate = addDays(orderDate, 150);
  reminders.push(createReminder(db, {
    customer_id: order.customer_id,
    order_id: orderId,
    type: 'tarnish_alert',
    title: '5-Month Tarnish Check',
    message: `Hi ${order.customer_name}! 💎\n\nNoticed slight dullness on your silver jewellery? That's completely normal!\n\nBring it in for professional polishing — we'll make it shine like new. ✨\n\nChamathka Jewellers`,
    send_date: fiveMonthDate,
    channel: order.communication_preference || 'email'
  }));

  // 6. 6 months: Cross-sell
  const sixMonthDate = addDays(orderDate, 180);
  reminders.push(createReminder(db, {
    customer_id: order.customer_id,
    order_id: orderId,
    type: 'cross_sell',
    title: '6-Month Recommendation',
    message: `Hi ${order.customer_name}! 💎\n\nComplete your ${stoneLabel} collection!\n\nWe've picked some pieces that match your style perfectly. Visit us to see what's new!\n\nChamathka Jewellers`,
    send_date: sixMonthDate,
    channel: order.communication_preference || 'email'
  }));

  return reminders;
}

/**
 * Process all due reminders (called by cron)
 */
function processReminders(db) {
  const now = new Date().toISOString();
  
  const dueReminders = db.prepare(`
    SELECT r.*, c.name as customer_name, c.communication_preference
    FROM reminders r
    JOIN customers c ON r.customer_id = c.id
    WHERE r.status = 'pending' AND r.send_date <= ?
  `).all(now);

  let processed = 0;

  for (const reminder of dueReminders) {
    try {
      sendMessage(db, reminder.customer_id, reminder.title, reminder.message);
      
      db.prepare(`
        UPDATE reminders SET status = 'sent', sent_at = datetime('now') WHERE id = ?
      `).run(reminder.id);
      
      processed++;
    } catch (err) {
      console.error(`Failed to process reminder #${reminder.id}:`, err.message);
      db.prepare(`UPDATE reminders SET status = 'failed' WHERE id = ?`).run(reminder.id);
    }
  }

  // Also check for birthday offers
  processBirthdayOffers(db);

  console.log(`✅ Processed ${processed}/${dueReminders.length} reminders`);
  return { processed, total: dueReminders.length };
}

/**
 * Process birthday offers for the current month
 */
function processBirthdayOffers(db) {
  const birthdayCustomers = getCustomersWithBirthdayThisMonth(db);
  
  for (const customer of birthdayCustomers) {
    if (!customer.offer) continue;

    // Check if already sent this month
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const alreadySent = db.prepare(`
      SELECT COUNT(*) as count FROM reminders 
      WHERE customer_id = ? AND type = 'birthday_offer' 
        AND substr(send_date, 1, 7) = ?
    `).get(customer.id, `${currentYear}-${currentMonth.toString().padStart(2, '0')}`);

    if (alreadySent.count === 0) {
      createReminder(db, {
        customer_id: customer.id,
        type: 'birthday_offer',
        title: customer.offer.subject,
        message: customer.offer.message,
        send_date: new Date().toISOString(),
        channel: customer.communication_preference || 'email'
      });
    }
  }
}

/**
 * Create a reminder record
 */
function createReminder(db, data) {
  const result = db.prepare(`
    INSERT INTO reminders (customer_id, order_id, type, title, message, send_date, channel)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.customer_id,
    data.order_id || null,
    data.type,
    data.title,
    data.message,
    typeof data.send_date === 'string' ? data.send_date : data.send_date.toISOString(),
    data.channel || 'email'
  );

  return { id: result.lastInsertRowid, ...data };
}

/**
 * Helper: Add days to a date
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

module.exports = {
  scheduleAftercare,
  processReminders,
  processBirthdayOffers,
  createReminder
};
