const path = require("path");
const Database = require("better-sqlite3");
const { app } = require("electron");

let db;

function initDatabase() {
  if (db) return db;

  const dbPath = path.join(app.getPath("userData"), "app.db");
  db = new Database(dbPath);

  // SQLite pragmas
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  db.pragma("foreign_keys = ON");

  /* ---------------- SETTINGS TABLE ---------------- */
  db.prepare(`
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
  `).run();

  // ---- Ensure SINGLE settings row exists ----
  db.prepare("INSERT OR IGNORE INTO settings (id) VALUES (1)").run();

  /* ---------------- ITEMS ---------------- */
  db.prepare(`
    CREATE TABLE IF NOT EXISTS items (
      itemID TEXT PRIMARY KEY,
      itemName TEXT NOT NULL,
      unit TEXT NOT NULL,
      purchaseRate REAL NOT NULL,
      purchaseDate TEXT NOT NULL,
      sellingPrice REAL,
      vendorId INTEGER NOT NULL,
      purchaseId INTEGER,
      hasVariants INTEGER NOT NULL,
      FOREIGN KEY (vendorId) REFERENCES vendors(id) ON DELETE CASCADE,
      FOREIGN KEY (purchaseId) REFERENCES purchases(id) ON DELETE CASCADE
    );
  `).run();

  /* ---------------- ITEM VARIANTS ---------------- */
  db.prepare(`
    CREATE TABLE IF NOT EXISTS item_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      itemID TEXT NOT NULL,
      size TEXT NOT NULL,
      sellingPrice REAL NOT NULL,
      purchaseId INTEGER,
      FOREIGN KEY (itemID) REFERENCES items(itemID) ON DELETE CASCADE,
      FOREIGN KEY (purchaseId) REFERENCES purchases(id) ON DELETE CASCADE
    );
  `).run();

  /* ---------------- SIZES ---------------- */
  db.prepare(`
    CREATE TABLE IF NOT EXISTS sizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      size TEXT UNIQUE
    );
  `).run();

  /* ---------------- BILLS ---------------- */
  db.prepare(`
    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_pieces INTEGER,
      total_before_discount REAL,
      discount REAL,
      discount_amount REAL,
      total_after_discount REAL,
      payment_mode TEXT
    );
  `).run();

  /* ---------------- BILL ITEMS ---------------- */
  db.prepare(`
    CREATE TABLE IF NOT EXISTS bill_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_id INTEGER NOT NULL,
      item_code TEXT,
      item_name TEXT,
      price REAL,
      size TEXT,
      quantity INTEGER,
      total_amount REAL,
      FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
    );
  `).run();

  /* ---------------- VENDORS ---------------- */
  db.prepare(`
    CREATE TABLE IF NOT EXISTS vendors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendorName TEXT NOT NULL,
      contactPerson TEXT,
      phone TEXT NOT NULL,
      whatsapp TEXT,
      email TEXT NOT NULL,
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
  `).run();

  /* ---------------- PURCHASES ---------------- */
  db.prepare(`
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
  `).run();

  console.log("✅ Database initialized successfully");

  return db;
}

module.exports = { initDatabase };
