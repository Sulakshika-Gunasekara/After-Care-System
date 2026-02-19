/**
 * Messaging Service (Mock)
 * Handles WhatsApp, Email, and SMS message sending with logging
 * Replace mock functions with real API calls when ready
 */

/**
 * Send a WhatsApp message (mock — logs to DB)
 */
function sendWhatsApp(db, customerId, message, subject = '') {
  console.log(`📱 WhatsApp → Customer #${customerId}: ${subject || message.substring(0, 50)}...`);
  
  db.prepare(`
    INSERT INTO message_log (customer_id, channel, type, subject, message, status)
    VALUES (?, 'whatsapp', 'automated', ?, ?, 'sent')
  `).run(customerId, subject, message);

  return { success: true, channel: 'whatsapp', customerId };
}

/**
 * Send an Email (mock — logs to DB)
 */
function sendEmail(db, customerId, subject, message) {
  console.log(`📧 Email → Customer #${customerId}: ${subject}`);

  db.prepare(`
    INSERT INTO message_log (customer_id, channel, type, subject, message, status)
    VALUES (?, 'email', 'automated', ?, ?, 'sent')
  `).run(customerId, subject, message);

  return { success: true, channel: 'email', customerId };
}

/**
 * Send an SMS (mock — logs to DB)
 */
function sendSMS(db, customerId, message) {
  console.log(`💬 SMS → Customer #${customerId}: ${message.substring(0, 50)}...`);

  db.prepare(`
    INSERT INTO message_log (customer_id, channel, type, subject, message, status)
    VALUES (?, 'sms', 'automated', '', ?, 'sent')
  `).run(customerId, message);

  return { success: true, channel: 'sms', customerId };
}

/**
 * Send message via customer's preferred channel
 */
function sendMessage(db, customerId, subject, message) {
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);
  if (!customer) return { success: false, error: 'Customer not found' };

  const pref = customer.communication_preference || 'email';

  switch (pref) {
    case 'whatsapp': return sendWhatsApp(db, customerId, message, subject);
    case 'sms':      return sendSMS(db, customerId, message);
    case 'email':
    default:         return sendEmail(db, customerId, subject, message);
  }
}

/**
 * Send welcome + care guide after purchase
 */
function sendWelcomeMessage(db, customerId, stoneType) {
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);
  if (!customer) return;

  const careGuide = getCareGuide(stoneType);
  
  const message = `Thank you for choosing Chamathka Jewellers, ${customer.name}! 💎\n\n` +
    `We hope you love your new ${stoneType || 'silver'} jewellery.\n\n` +
    `✨ SILVER JEWELLERY CARE GUIDE ✨\n\n` +
    careGuide + '\n\n' +
    `📞 Questions? Contact us anytime!\n` +
    `📧 care@chamathka.com | 📱 +94 77 XXX XXXX\n\n` +
    `With love,\nChamathka Jewellers 💎`;

  return sendMessage(db, customerId, 'Thank you for choosing Chamathka 💎', message);
}

/**
 * Get care guide text based on stone type
 */
function getCareGuide(stoneType) {
  const silverCare = [
    '• Avoid spraying perfume directly on your jewellery',
    '• Remove before showering or swimming',
    '• Keep away from high heat and humidity',
    '• Avoid contact with chemicals and cleaning products',
    '• Store in a dry, cool place (use the pouch provided)',
    '• Use a soft cloth to gently polish',
    '• Avoid direct sunlight for extended periods'
  ].join('\n');

  const stoneCare = {
    'Emerald': '\n\n💚 Emerald Care:\n• Clean with lukewarm water and mild soap\n• Avoid ultrasonic cleaners\n• Store separately to prevent scratching',
    'Ruby': '\n\n❤️ Ruby Care:\n• Clean with warm soapy water\n• Safe for ultrasonic cleaning\n• Avoid harsh impacts',
    'Sapphire': '\n\n💙 Sapphire Care:\n• Clean with warm water and mild detergent\n• Safe for ultrasonic cleaning\n• Store in soft pouch',
    'Pearl': '\n\n🤍 Pearl Care:\n• Wipe with damp cloth after wearing\n• NEVER use chemicals or ultrasonic cleaners\n• Last on, first off — put pearls on last\n• Store flat to prevent stretching',
    'Amethyst': '\n\n💜 Amethyst Care:\n• Avoid prolonged sun exposure (may fade)\n• Clean with mild soap and water\n• Store away from harder gemstones',
    'Diamond': '\n\n💎 Diamond Care:\n• Clean with ammonia-based solution\n• Safe for ultrasonic cleaning\n• Store separately to avoid scratching other pieces'
  };

  return silverCare + (stoneCare[stoneType] || '');
}

/**
 * Get message history for a customer
 */
function getMessageHistory(db, customerId, limit = 50) {
  return db.prepare(`
    SELECT * FROM message_log 
    WHERE customer_id = ? 
    ORDER BY sent_at DESC 
    LIMIT ?
  `).all(customerId, limit);
}

module.exports = {
  sendWhatsApp,
  sendEmail,
  sendSMS,
  sendMessage,
  sendWelcomeMessage,
  getCareGuide,
  getMessageHistory
};
