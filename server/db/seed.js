/**
 * Database Seeder
 * Populates the database with sample data for Chamathka Care+
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'chamathka.db');
const db = new Database(DB_PATH);
const fs = require('fs');

// Run schema first
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

console.log('💎 Seeding Chamathka Care+ Database...\n');

// ── Products ──────────────────────────────────────────────────
const products = [
  { name: 'Emerald Teardrop Earrings', stone_type: 'Emerald', collection: 'Nature\'s Grace', category: 'Earrings', price: 12500, metal_finish: 'Silver', description: 'Elegant teardrop emerald earrings in sterling silver' },
  { name: 'Emerald Pendant Necklace', stone_type: 'Emerald', collection: 'Nature\'s Grace', category: 'Necklace', price: 18500, metal_finish: 'Silver', description: 'Beautiful emerald pendant on silver chain' },
  { name: 'Emerald Solitaire Ring', stone_type: 'Emerald', collection: 'Nature\'s Grace', category: 'Ring', price: 15000, metal_finish: 'Silver', description: 'Classic emerald solitaire ring' },
  { name: 'Ruby Heart Earrings', stone_type: 'Ruby', collection: 'Passion', category: 'Earrings', price: 14000, metal_finish: 'Silver', description: 'Heart-shaped ruby stud earrings' },
  { name: 'Ruby Heart Necklace', stone_type: 'Ruby', collection: 'Passion', category: 'Necklace', price: 22000, metal_finish: 'Silver', description: 'Stunning ruby heart pendant necklace' },
  { name: 'Ruby Eternity Ring', stone_type: 'Ruby', collection: 'Passion', category: 'Ring', price: 19500, metal_finish: 'Silver', description: 'Ruby eternity band in silver' },
  { name: 'Sapphire Cluster Earrings', stone_type: 'Sapphire', collection: 'Royal Blue', category: 'Earrings', price: 16000, metal_finish: 'Silver', description: 'Sapphire cluster drop earrings' },
  { name: 'Sapphire Tennis Bracelet', stone_type: 'Sapphire', collection: 'Royal Blue', category: 'Bracelet', price: 28000, metal_finish: 'Silver', description: 'Elegant sapphire tennis bracelet' },
  { name: 'Sapphire Halo Necklace', stone_type: 'Sapphire', collection: 'Royal Blue', category: 'Necklace', price: 24000, metal_finish: 'Silver', description: 'Sapphire halo pendant necklace' },
  { name: 'Pearl Drop Earrings', stone_type: 'Pearl', collection: 'Ocean\'s Gift', category: 'Earrings', price: 8500, metal_finish: 'Silver', description: 'Classic freshwater pearl drop earrings' },
  { name: 'Pearl Strand Necklace', stone_type: 'Pearl', collection: 'Ocean\'s Gift', category: 'Necklace', price: 15000, metal_finish: 'Silver', description: 'Elegant pearl strand necklace' },
  { name: 'Pearl Bracelet', stone_type: 'Pearl', collection: 'Ocean\'s Gift', category: 'Bracelet', price: 9500, metal_finish: 'Silver', description: 'Delicate pearl and silver bracelet' },
  { name: 'Amethyst Chandelier Earrings', stone_type: 'Amethyst', collection: 'Twilight', category: 'Earrings', price: 11000, metal_finish: 'Silver', description: 'Stunning amethyst chandelier earrings' },
  { name: 'Amethyst Statement Necklace', stone_type: 'Amethyst', collection: 'Twilight', category: 'Necklace', price: 20000, metal_finish: 'Silver', description: 'Bold amethyst statement piece' },
  { name: 'Diamond Stud Earrings', stone_type: 'Diamond', collection: 'Eternal', category: 'Earrings', price: 35000, metal_finish: 'Silver', description: 'Classic diamond stud earrings' },
  { name: 'Diamond Solitaire Necklace', stone_type: 'Diamond', collection: 'Eternal', category: 'Necklace', price: 45000, metal_finish: 'Silver', description: 'Timeless diamond solitaire pendant' },
  { name: 'Ruby & Emerald Full Set', stone_type: 'Ruby', collection: 'Celebration', category: 'Set', price: 55000, metal_finish: 'Silver', description: 'Complete set: earrings, necklace, ring, bracelet' },
  { name: 'Sapphire Bridal Set', stone_type: 'Sapphire', collection: 'Celebration', category: 'Set', price: 62000, metal_finish: 'Silver', description: 'Bridal collection: tiara, necklace, earrings' },
  { name: 'Pearl Elegant Set', stone_type: 'Pearl', collection: 'Ocean\'s Gift', category: 'Set', price: 32000, metal_finish: 'Silver', description: 'Pearl set: necklace, earrings, bracelet' },
  { name: 'Garnet Filigree Pendant', stone_type: 'Garnet', collection: 'Heritage', category: 'Pendant', price: 9800, metal_finish: 'Silver', description: 'Intricate garnet filigree pendant' },
  { name: 'Topaz Cocktail Ring', stone_type: 'Topaz', collection: 'Sunset', category: 'Ring', price: 13500, metal_finish: 'Silver', description: 'Bold topaz cocktail ring' },
  { name: 'Opal Dangle Earrings', stone_type: 'Opal', collection: 'Dreamscape', category: 'Earrings', price: 14500, metal_finish: 'Silver', description: 'Ethereal opal dangle earrings' },
  { name: 'Silver Chain Anklet', stone_type: null, collection: 'Basics', category: 'Anklet', price: 4500, metal_finish: 'Silver', description: 'Simple sterling silver anklet' },
  { name: 'Tanzanite Drop Necklace', stone_type: 'Tanzanite', collection: 'Twilight', category: 'Necklace', price: 27000, metal_finish: 'Silver', description: 'Rare tanzanite drop pendant' },
  { name: 'Peridot Stud Earrings', stone_type: 'Peridot', collection: 'Spring', category: 'Earrings', price: 7500, metal_finish: 'Silver', description: 'Fresh green peridot studs' },
];

const insertProduct = db.prepare(`
  INSERT INTO products (name, stone_type, collection, category, price, metal_finish, description, matching_product_ids)
  VALUES (?, ?, ?, ?, ?, ?, ?, '[]')
`);

for (const p of products) {
  insertProduct.run(p.name, p.stone_type, p.collection, p.category, p.price, p.metal_finish, p.description);
}
console.log(`✅ Inserted ${products.length} products`);

// ── Customers ─────────────────────────────────────────────────
const customers = [
  { name: 'Nimesha Fernando', phone: '+94771234567', email: 'nimesha@gmail.com', birthday: '1995-05-15', anniversary: '2020-06-10', preferred_stone: 'Emerald', tags: '["Valentine Customer","Gift Buyer"]', loyalty_level: 'Ruby Member', total_purchases: 7, total_spent: 98000, communication_preference: 'whatsapp' },
  { name: 'Kavindi Perera', phone: '+94772345678', email: 'kavindi@gmail.com', birthday: '1992-07-22', anniversary: null, preferred_stone: 'Sapphire', tags: '["Birthday Shopper"]', loyalty_level: 'Sapphire Elite', total_purchases: 12, total_spent: 185000, communication_preference: 'email' },
  { name: 'Rashmi Silva', phone: '+94773456789', email: 'rashmi@gmail.com', birthday: '1998-02-14', anniversary: '2022-02-14', preferred_stone: 'Ruby', tags: '["Valentine Customer","Romantic Buyer"]', loyalty_level: 'Silver Member', total_purchases: 4, total_spent: 55000, communication_preference: 'whatsapp' },
  { name: 'Dilshan Jayawardena', phone: '+94774567890', email: 'dilshan@gmail.com', birthday: '1990-11-30', anniversary: '2018-12-20', preferred_stone: 'Diamond', tags: '["Gift Buyer","Anniversary Shopper"]', loyalty_level: 'Silver Member', total_purchases: 5, total_spent: 120000, communication_preference: 'email' },
  { name: 'Shashini Wickramasinghe', phone: '+94775678901', email: 'shashini@gmail.com', birthday: '1996-03-08', anniversary: null, preferred_stone: 'Pearl', tags: '[]', loyalty_level: 'None', total_purchases: 2, total_spent: 24000, communication_preference: 'sms' },
  { name: 'Hasitha Bandara', phone: '+94776789012', email: 'hasitha@gmail.com', birthday: '1988-09-25', anniversary: '2015-04-18', preferred_stone: 'Sapphire', tags: '["Gift Buyer","Wedding Shopper"]', loyalty_level: 'Ruby Member', total_purchases: 8, total_spent: 156000, communication_preference: 'whatsapp' },
  { name: 'Madushani Kumari', phone: '+94777890123', email: 'madushani@gmail.com', birthday: '2000-01-10', anniversary: null, preferred_stone: 'Amethyst', tags: '["Birthday Shopper"]', loyalty_level: 'None', total_purchases: 1, total_spent: 11000, communication_preference: 'email' },
  { name: 'Thisara Rathnayake', phone: '+94778901234', email: 'thisara@gmail.com', birthday: '1994-06-05', anniversary: '2021-08-15', preferred_stone: 'Ruby', tags: '["Romantic Buyer","Valentine Customer"]', loyalty_level: 'Silver Member', total_purchases: 3, total_spent: 42000, communication_preference: 'whatsapp' },
  { name: 'Isuri Gunasekara', phone: '+94779012345', email: 'isuri@gmail.com', birthday: '1997-12-18', anniversary: null, preferred_stone: 'Emerald', tags: '[]', loyalty_level: 'None', total_purchases: 2, total_spent: 31000, communication_preference: 'email' },
  { name: 'Chamara de Alwis', phone: '+94770123456', email: 'chamara@gmail.com', birthday: '1985-08-20', anniversary: '2012-10-05', preferred_stone: 'Diamond', tags: '["Gift Buyer","Anniversary Shopper"]', loyalty_level: 'Sapphire Elite', total_purchases: 15, total_spent: 325000, communication_preference: 'email' },
  { name: 'Sanduni Rajapakse', phone: '+94771122334', email: 'sanduni@gmail.com', birthday: '1993-04-12', anniversary: null, preferred_stone: 'Pearl', tags: '["Birthday Shopper"]', loyalty_level: 'Silver Member', total_purchases: 4, total_spent: 48000, communication_preference: 'whatsapp' },
  { name: 'Nuwan Dissanayake', phone: '+94772233445', email: 'nuwan@gmail.com', birthday: '1991-10-02', anniversary: '2019-11-20', preferred_stone: 'Garnet', tags: '["Gift Buyer"]', loyalty_level: 'Ruby Member', total_purchases: 6, total_spent: 89000, communication_preference: 'sms' },
  { name: 'Hiruni Abeysekara', phone: '+94773344556', email: 'hiruni@gmail.com', birthday: '1999-07-30', anniversary: null, preferred_stone: 'Topaz', tags: '[]', loyalty_level: 'None', total_purchases: 1, total_spent: 13500, communication_preference: 'email' },
  { name: 'Sachini Weerasinghe', phone: '+94774455667', email: 'sachini@gmail.com', birthday: '1996-11-11', anniversary: '2023-01-14', preferred_stone: 'Ruby', tags: '["Valentine Customer","Romantic Buyer"]', loyalty_level: 'Silver Member', total_purchases: 3, total_spent: 55000, communication_preference: 'whatsapp' },
  { name: 'Lakshan Gunawardana', phone: '+94775566778', email: 'lakshan@gmail.com', birthday: '1987-02-28', anniversary: '2014-05-22', preferred_stone: 'Sapphire', tags: '["Gift Buyer","Wedding Shopper"]', loyalty_level: 'Ruby Member', total_purchases: 9, total_spent: 198000, communication_preference: 'email' },
];

const insertCustomer = db.prepare(`
  INSERT INTO customers (name, phone, email, birthday, anniversary, preferred_stone, tags, loyalty_level, total_purchases, total_spent, communication_preference)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const c of customers) {
  insertCustomer.run(c.name, c.phone, c.email, c.birthday, c.anniversary, c.preferred_stone, c.tags, c.loyalty_level, c.total_purchases, c.total_spent, c.communication_preference);
}
console.log(`✅ Inserted ${customers.length} customers`);

// ── Orders ────────────────────────────────────────────────────
const orders = [
  { customer_id: 1, order_date: '2025-02-10', occasion: "Valentine's", gift_for: 'Partner', total_amount: 14000, channel: 'offline' },
  { customer_id: 1, order_date: '2025-05-15', occasion: 'Birthday', gift_for: 'Self', total_amount: 18500, channel: 'online' },
  { customer_id: 2, order_date: '2025-01-20', occasion: null, gift_for: 'Self', total_amount: 24000, channel: 'offline' },
  { customer_id: 2, order_date: '2025-04-05', occasion: null, gift_for: 'Self', total_amount: 28000, channel: 'online' },
  { customer_id: 2, order_date: '2025-07-22', occasion: 'Birthday', gift_for: 'Self', total_amount: 16000, channel: 'offline' },
  { customer_id: 3, order_date: '2026-02-01', occasion: "Valentine's", gift_for: 'Partner', total_amount: 22000, channel: 'offline' },
  { customer_id: 4, order_date: '2025-12-15', occasion: 'Anniversary', gift_for: 'Wife', total_amount: 45000, channel: 'offline' },
  { customer_id: 5, order_date: '2025-11-10', occasion: null, gift_for: 'Self', total_amount: 8500, channel: 'online' },
  { customer_id: 5, order_date: '2026-01-20', occasion: null, gift_for: 'Self', total_amount: 15000, channel: 'online' },
  { customer_id: 6, order_date: '2025-04-18', occasion: 'Anniversary', gift_for: 'Wife', total_amount: 62000, channel: 'offline' },
  { customer_id: 6, order_date: '2025-09-10', occasion: null, gift_for: 'Self', total_amount: 27000, channel: 'online' },
  { customer_id: 7, order_date: '2025-12-25', occasion: 'Christmas', gift_for: 'Self', total_amount: 11000, channel: 'online' },
  { customer_id: 8, order_date: '2026-02-13', occasion: "Valentine's", gift_for: 'Partner', total_amount: 19500, channel: 'offline' },
  { customer_id: 10, order_date: '2025-10-05', occasion: 'Anniversary', gift_for: 'Wife', total_amount: 55000, channel: 'offline' },
  { customer_id: 10, order_date: '2026-01-15', occasion: null, gift_for: 'Self', total_amount: 35000, channel: 'online' },
  { customer_id: 11, order_date: '2025-08-12', occasion: null, gift_for: 'Self', total_amount: 9500, channel: 'online' },
  { customer_id: 12, order_date: '2025-06-20', occasion: 'Birthday', gift_for: 'Sister', total_amount: 14500, channel: 'offline' },
  { customer_id: 14, order_date: '2026-01-14', occasion: "Valentine's", gift_for: 'Partner', total_amount: 22000, channel: 'offline' },
  { customer_id: 15, order_date: '2025-05-22', occasion: 'Anniversary', gift_for: 'Wife', total_amount: 62000, channel: 'offline' },
  { customer_id: 15, order_date: '2025-11-30', occasion: null, gift_for: 'Self', total_amount: 28000, channel: 'online' },
];

const insertOrder = db.prepare(`
  INSERT INTO orders (customer_id, order_date, occasion, gift_for, total_amount, channel)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertOrderItem = db.prepare(`
  INSERT INTO order_items (order_id, product_id, stone_type, category, quantity, unit_price)
  VALUES (?, ?, ?, ?, ?, ?)
`);

for (const o of orders) {
  const result = insertOrder.run(o.customer_id, o.order_date, o.occasion, o.gift_for, o.total_amount, o.channel);
  // Add 1-2 random items to each order
  const productIdx = Math.floor(Math.random() * products.length);
  const product = products[productIdx];
  insertOrderItem.run(result.lastInsertRowid, productIdx + 1, product.stone_type, product.category, 1, product.price);
}
console.log(`✅ Inserted ${orders.length} orders with items`);

// ── Reminders ─────────────────────────────────────────────────
const reminders = [
  { customer_id: 3, order_id: 6, type: 'review_request', title: 'Feedback Request', message: 'Hi Rashmi! How do you like your Ruby Heart Necklace? Share your feedback!', send_date: '2026-02-08', status: 'sent' },
  { customer_id: 3, order_id: 6, type: 'cleaning_reminder', title: '1-Month Free Cleaning', message: 'Hi Rashmi! Time for a free cleaning of your Ruby necklace!', send_date: '2026-03-01', status: 'pending' },
  { customer_id: 8, order_id: 13, type: 'review_request', title: 'Feedback Request', message: 'Hi Thisara! We hope your partner loved the gift!', send_date: '2026-02-20', status: 'pending' },
  { customer_id: 8, order_id: 13, type: 'cleaning_reminder', title: '1-Month Free Cleaning', message: 'Hi Thisara! Your jewellery deserves a shine-up. Visit us!', send_date: '2026-03-13', status: 'pending' },
  { customer_id: 14, order_id: 18, type: 'review_request', title: 'Feedback Request', message: 'Hi Sachini! How was your Valentine\'s shopping experience?', send_date: '2026-01-21', status: 'sent' },
  { customer_id: 14, order_id: 18, type: 'cleaning_reminder', title: '1-Month Cleaning', message: 'Hi Sachini! Time for a free professional cleaning!', send_date: '2026-02-14', status: 'pending' },
  { customer_id: 1, type: 'birthday_offer', title: 'Birthday Month Offer 💚', message: 'Happy Birthday Month Nimesha! Your birthstone is Emerald 💚 Get 15% OFF!', send_date: '2026-05-01', status: 'pending' },
  { customer_id: 10, type: 'cross_sell', title: 'Complete Your Diamond Collection', message: 'Hi Chamara! You\'d love our new Diamond Eternity Ring to match your studs!', send_date: '2026-02-25', status: 'pending' },
];

const insertReminder = db.prepare(`
  INSERT INTO reminders (customer_id, order_id, type, title, message, send_date, status)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

for (const r of reminders) {
  insertReminder.run(r.customer_id, r.order_id || null, r.type, r.title, r.message, r.send_date, r.status);
}
console.log(`✅ Inserted ${reminders.length} reminders`);

// ── Campaigns ─────────────────────────────────────────────────
const campaigns = [
  { name: "Valentine's Day 2026", type: 'seasonal', target_tags: '["Valentine Customer","Romantic Buyer"]', subject: "This Valentine's, Shine Brighter ❤️", message_template: 'Hi {name}! Last Valentine\'s you chose something special 💎 This year we have something even more beautiful ❤️ Visit us before Feb 14!', scheduled_date: '2026-01-25', status: 'scheduled' },
  { name: 'Birthday Stone Campaign', type: 'birthday', target_tags: '["Birthday Shopper"]', subject: 'Your Birthstone Awaits! 💎', message_template: 'Hi {name}! Your birthstone month is here! Get 15% OFF on all {preferred_stone} jewellery this month. 💎', scheduled_date: null, status: 'draft' },
  { name: 'New Collection Launch', type: 'announcement', target_tags: '[]', subject: '✨ New Twilight Collection is Here!', message_template: 'Hi {name}! Our stunning new Twilight Collection just dropped! Be the first to see our Amethyst & Tanzanite pieces. Shop now! ✨', scheduled_date: '2026-03-01', status: 'draft' },
];

const insertCampaign = db.prepare(`
  INSERT INTO campaigns (name, type, target_tags, subject, message_template, scheduled_date, status)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

for (const c of campaigns) {
  insertCampaign.run(c.name, c.type, c.target_tags, c.subject, c.message_template, c.scheduled_date, c.status);
}
console.log(`✅ Inserted ${campaigns.length} campaigns`);

// ── Feedback ──────────────────────────────────────────────────
const feedbackEntries = [
  { customer_id: 1, order_id: 1, satisfaction: 5, stone_quality: 5, packaging: 4, delivery: null, comments: 'Beautiful earrings! My partner loved them.' },
  { customer_id: 2, order_id: 3, satisfaction: 5, stone_quality: 5, packaging: 5, delivery: 5, comments: 'Absolutely stunning sapphire necklace. Best quality I\'ve seen!' },
  { customer_id: 2, order_id: 4, satisfaction: 4, stone_quality: 5, packaging: 4, delivery: 4, comments: 'Great bracelet, slight delay in delivery though.' },
  { customer_id: 4, order_id: 7, satisfaction: 5, stone_quality: 5, packaging: 5, delivery: null, comments: 'Wife was so happy with the diamond necklace. Thank you Chamathka!' },
  { customer_id: 6, order_id: 10, satisfaction: 5, stone_quality: 5, packaging: 5, delivery: null, comments: 'Anniversary set was perfect. Premium packaging too!' },
  { customer_id: 10, order_id: 14, satisfaction: 4, stone_quality: 5, packaging: 4, delivery: null, comments: 'Great ruby set but the box could be more premium.' },
];

const insertFeedback = db.prepare(`
  INSERT INTO feedback (customer_id, order_id, satisfaction, stone_quality, packaging, delivery, comments, discount_code)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const f of feedbackEntries) {
  const code = `THANKS${f.customer_id}${Date.now().toString(36).toUpperCase()}`;
  insertFeedback.run(f.customer_id, f.order_id, f.satisfaction, f.stone_quality, f.packaging, f.delivery, f.comments, code);
}
console.log(`✅ Inserted ${feedbackEntries.length} feedback entries`);

console.log('\n💎 Database seeded successfully!\n');
db.close();
