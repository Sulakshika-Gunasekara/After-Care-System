/**
 * Birthstone Intelligence Service
 * Maps birth months to birthstones and generates personalized offers
 */

const BIRTHSTONE_MAP = {
  1:  { stone: 'Garnet',     color: '#8B0000', emoji: '🔴' },
  2:  { stone: 'Amethyst',   color: '#9966CC', emoji: '💜' },
  3:  { stone: 'Aquamarine', color: '#7FFFD4', emoji: '💙' },
  4:  { stone: 'Diamond',    color: '#B9F2FF', emoji: '💎' },
  5:  { stone: 'Emerald',    color: '#50C878', emoji: '💚' },
  6:  { stone: 'Pearl',      color: '#FDEEF4', emoji: '🤍' },
  7:  { stone: 'Ruby',       color: '#E0115F', emoji: '❤️' },
  8:  { stone: 'Peridot',    color: '#B4C424', emoji: '💛' },
  9:  { stone: 'Sapphire',   color: '#0F52BA', emoji: '💙' },
  10: { stone: 'Opal',       color: '#A8C3BC', emoji: '🤍' },
  11: { stone: 'Topaz',      color: '#FFC87C', emoji: '🧡' },
  12: { stone: 'Tanzanite',  color: '#4D5B9E', emoji: '💜' }
};

function getBirthstone(month) {
  return BIRTHSTONE_MAP[month] || null;
}

function getBirthstoneFromDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  return getBirthstone(month);
}

function generateBirthstoneOffer(customer) {
  if (!customer.birthday) return null;
  
  const birthstone = getBirthstoneFromDate(customer.birthday);
  if (!birthstone) return null;

  return {
    customer_id: customer.id,
    customer_name: customer.name,
    birthstone: birthstone.stone,
    emoji: birthstone.emoji,
    message: `Happy Birthday Month, ${customer.name}! ${birthstone.emoji}\n\nYour birthstone is ${birthstone.stone}! Get 15% OFF this month on all ${birthstone.stone} jewellery.\n\nUse code: BDAY${birthstone.stone.toUpperCase()}\n\n💎 Chamathka Jewellers`,
    subject: `Your Birthstone is ${birthstone.stone} ${birthstone.emoji} — Special Birthday Offer Inside!`,
    discount: 15
  };
}

function getCustomersWithBirthdayThisMonth(db) {
  const currentMonth = new Date().getMonth() + 1;
  const monthStr = currentMonth.toString().padStart(2, '0');
  
  const customers = db.prepare(`
    SELECT * FROM customers 
    WHERE substr(birthday, 6, 2) = ?
  `).all(monthStr);

  return customers.map(c => ({
    ...c,
    offer: generateBirthstoneOffer(c)
  }));
}

module.exports = {
  BIRTHSTONE_MAP,
  getBirthstone,
  getBirthstoneFromDate,
  generateBirthstoneOffer,
  getCustomersWithBirthdayThisMonth
};
