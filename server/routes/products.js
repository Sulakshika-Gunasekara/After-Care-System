const express = require('express');
const router = express.Router();

// GET all products
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const { stone_type, category, collection, search, in_stock, limit = 100 } = req.query;

  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (stone_type) { query += ' AND stone_type = ?'; params.push(stone_type); }
  if (category) { query += ' AND category = ?'; params.push(category); }
  if (collection) { query += ' AND collection = ?'; params.push(collection); }
  if (in_stock !== undefined) { query += ' AND in_stock = ?'; params.push(Number(in_stock)); }
  if (search) { query += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(Number(limit));

  const products = db.prepare(query).all(...params);
  const total = db.prepare('SELECT COUNT(*) as count FROM products').get().count;

  // Get unique values for filters
  const stoneTypes = db.prepare('SELECT DISTINCT stone_type FROM products WHERE stone_type IS NOT NULL').all().map(r => r.stone_type);
  const categories = db.prepare('SELECT DISTINCT category FROM products').all().map(r => r.category);
  const collections = db.prepare('SELECT DISTINCT collection FROM products WHERE collection IS NOT NULL').all().map(r => r.collection);

  res.json({ products, total, filters: { stoneTypes, categories, collections } });
});

// GET single product
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  // Get matching products
  const matchIds = JSON.parse(product.matching_product_ids || '[]');
  let matchingProducts = [];
  if (matchIds.length > 0) {
    const placeholders = matchIds.map(() => '?').join(',');
    matchingProducts = db.prepare(`SELECT * FROM products WHERE id IN (${placeholders})`).all(...matchIds);
  }

  res.json({ product, matchingProducts });
});

// POST create product
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { name, stone_type, collection, category, price, image_url, description, matching_product_ids, metal_finish } = req.body;

  if (!name || !category || !price) {
    return res.status(400).json({ error: 'Name, category, and price are required' });
  }

  const result = db.prepare(`
    INSERT INTO products (name, stone_type, collection, category, price, image_url, description, matching_product_ids, metal_finish)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name, stone_type || null, collection || null, category, price,
    image_url || null, description || null,
    JSON.stringify(matching_product_ids || []), metal_finish || 'Silver'
  );

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(product);
});

// PUT update product
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  const { name, stone_type, collection, category, price, image_url, description, matching_product_ids, metal_finish, in_stock } = req.body;

  db.prepare(`
    UPDATE products SET 
      name = ?, stone_type = ?, collection = ?, category = ?, price = ?,
      image_url = ?, description = ?, matching_product_ids = ?, metal_finish = ?, in_stock = ?
    WHERE id = ?
  `).run(
    name || existing.name, stone_type ?? existing.stone_type, collection ?? existing.collection,
    category || existing.category, price || existing.price,
    image_url ?? existing.image_url, description ?? existing.description,
    matching_product_ids ? JSON.stringify(matching_product_ids) : existing.matching_product_ids,
    metal_finish || existing.metal_finish, in_stock ?? existing.in_stock, req.params.id
  );

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json(product);
});

// DELETE product
router.delete('/:id', (req, res) => {
  const db = req.app.locals.db;
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Product deleted' });
});

module.exports = router;
