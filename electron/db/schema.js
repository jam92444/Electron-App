const fullSchema = `

PRAGMA foreign_keys = ON;

-- =============================
-- USERS
-- =============================
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  email TEXT,
  status TEXT DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================
-- ROLES
-- =============================
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO roles (name, description)
VALUES ('super_admin', 'Full system access');

-- =============================
-- PERMISSIONS
-- =============================
CREATE TABLE IF NOT EXISTS permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  permission_key TEXT UNIQUE NOT NULL,
  description TEXT
);

INSERT OR IGNORE INTO permissions (permission_key) VALUES
('*.*'),
('items.create'),
('items.view'),
('items.update'),
('items.delete'),
('size.create'),
('size.view'),
('size.update'),
('size.delete'),
('discount.create'),
('discount.view'),
('discount.update'),
('discount.delete'),
('vendor.create'),
('vendor.view'),
('vendor.update'),
('vendor.delete'),
('customer.create'),
('customer.view'),
('customer.update'),
('customer.delete'),
('bill.create'),
('bill.view'),
('bill.update'),
('bill.delete'),
('purchase.create'),
('purchase.view'),
('purchase.update'),
('purchase.delete'),
('label.create'),
('label.view'),
('label.update'),
('label.delete'),
('user.create'),
('user.view'),
('user.update'),
('user.delete'),
('company_setting.view'),
('company_setting.update'),
('user_profile.view'),
('user_profile.update');

-- =============================
-- USER ROLES (Many-to-Many)
-- =============================
CREATE TABLE IF NOT EXISTS user_roles (
  user_id INTEGER,
  role_id INTEGER,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- =============================
-- ROLE PERMISSIONS
-- =============================
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INTEGER,
  permission_id INTEGER,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY(permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Assign *.* permission to super_admin role
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'super_admin'
AND p.permission_key = '*.*';

-- =============================
-- SUPER ADMIN USER
-- IMPORTANT: Replace password hash with bcrypt hash
-- =============================
INSERT OR IGNORE INTO users 
(username, password_hash, full_name, email, status)
VALUES 
('superadmin', '$2b$10$REPLACE_WITH_REAL_HASH', 'Super Admin', 'superadmin@gmail.com', 'Active');

-- Assign super_admin role to superadmin user
INSERT OR IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'superadmin'
AND r.name = 'super_admin';

-- =============================
-- VENDORS
-- =============================
CREATE TABLE IF NOT EXISTS vendors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendorName TEXT NOT NULL,
  contactPerson TEXT,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  address1 TEXT NOT NULL,
  address2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'IN',
  gstType TEXT,
  gstNumber TEXT,
  bankName TEXT,
  accountHolder TEXT,
  accountNumber TEXT,
  ifsc TEXT,
  upi TEXT,
  paymentTerms TEXT DEFAULT '30 Days',
  status TEXT DEFAULT 'Active'
);

-- =============================
-- PURCHASES
-- =============================
CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  purchaseDate TEXT NOT NULL,
  vendorId INTEGER NOT NULL,
  totalAmount REAL DEFAULT 0,
  remarks TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendorId) REFERENCES vendors(id) ON DELETE CASCADE
);

-- =============================
-- ITEMS
-- =============================
CREATE TABLE IF NOT EXISTS items (
  itemID TEXT PRIMARY KEY,
  itemName TEXT NOT NULL,
  unit TEXT NOT NULL,
  purchaseRate REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  purchaseDate TEXT NOT NULL,
  sellingPrice REAL,
  vendorId INTEGER,
  purchaseId INTEGER,
  hasVariants INTEGER NOT NULL,
  FOREIGN KEY (vendorId) REFERENCES vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (purchaseId) REFERENCES purchases(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS item_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  itemID TEXT NOT NULL,
  size TEXT NOT NULL,
  sellingPrice REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  purchaseId INTEGER,
  FOREIGN KEY (itemID) REFERENCES items(itemID) ON DELETE CASCADE,
  FOREIGN KEY (purchaseId) REFERENCES purchases(id) ON DELETE CASCADE
);

-- =============================
-- SIZES
-- =============================
CREATE TABLE IF NOT EXISTS sizes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  size TEXT UNIQUE
);

-- =============================
-- DISCOUNTS
-- =============================
CREATE TABLE IF NOT EXISTS discounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  percentage REAL NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  valid_days INTEGER NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================
-- CUSTOMERS
-- =============================
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  discountId INTEGER,
  discountPercentage REAL DEFAULT 0,
  discountStartDate TEXT,
  discountEndDate TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(discountId) REFERENCES discounts(id) ON DELETE SET NULL
);

-- =============================
-- BILLS
-- =============================
CREATE TABLE IF NOT EXISTS bills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT,
  customer_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_pieces INTEGER,
  total_before_discount REAL,
  discount REAL,
  discount_amount REAL,
  total_after_discount REAL,
  payment_mode TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS bill_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_id INTEGER NOT NULL,
  item_code TEXT,
  item_name TEXT,
  price REAL,
  size TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount REAL,
  FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
);

-- =============================
-- SETTINGS
-- =============================
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  companyName TEXT,
  gstTin TEXT,
  contactNumber TEXT,
  companyEmail TEXT,
  fullAddress TEXT,
  country TEXT,
  state TEXT,
  city TEXT,
  pinCode TEXT,
  website TEXT,
  termsConditions TEXT,
  supportContact TEXT,
  invoicePrefix TEXT,
  enableInvoicePrefix INTEGER DEFAULT 0,
  lastInvoiceNumber INTEGER DEFAULT 0
);

`;

module.exports = fullSchema;
