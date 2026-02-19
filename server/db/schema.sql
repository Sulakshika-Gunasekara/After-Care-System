-- Chamathka Care+ System Database Schema

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    birthday TEXT,
    anniversary TEXT,
    preferred_stone TEXT,
    preferred_jewellery_type TEXT,
    tags TEXT DEFAULT '[]',
    total_purchases INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0,
    loyalty_level TEXT DEFAULT 'None',
    communication_preference TEXT DEFAULT 'email',
    gifted_to TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    stone_type TEXT,
    collection TEXT,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    image_url TEXT,
    description TEXT,
    matching_product_ids TEXT DEFAULT '[]',
    metal_finish TEXT DEFAULT 'Silver',
    in_stock INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    order_date TEXT DEFAULT (datetime('now')),
    occasion TEXT,
    gift_for TEXT,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'completed',
    channel TEXT DEFAULT 'offline',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    stone_type TEXT,
    category TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    order_id INTEGER,
    type TEXT NOT NULL,
    title TEXT,
    message TEXT,
    send_date TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    channel TEXT DEFAULT 'email',
    sent_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    target_tags TEXT DEFAULT '[]',
    message_template TEXT,
    subject TEXT,
    scheduled_date TEXT,
    status TEXT DEFAULT 'draft',
    sent_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Loyalty History table
CREATE TABLE IF NOT EXISTS loyalty_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    previous_tier TEXT,
    new_tier TEXT,
    reason TEXT,
    changed_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    order_id INTEGER,
    satisfaction INTEGER,
    stone_quality INTEGER,
    packaging INTEGER,
    delivery INTEGER,
    comments TEXT,
    discount_code TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Message Log table
CREATE TABLE IF NOT EXISTS message_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    channel TEXT NOT NULL,
    type TEXT,
    subject TEXT,
    message TEXT,
    status TEXT DEFAULT 'sent',
    sent_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_loyalty ON customers(loyalty_level);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(send_date);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_feedback_customer ON feedback(customer_id);
CREATE INDEX IF NOT EXISTS idx_message_log_customer ON message_log(customer_id);
