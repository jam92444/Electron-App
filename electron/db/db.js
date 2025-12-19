const path = require("path");
const Database = require("better-sqlite3");
const { app } = require("electron");

let db;

function initDatabase() {
  if (db) return db;

  const dbPath = path.join(app.getPath("userData"), "app.db");

  db = new Database(dbPath);

  // 🔥 REQUIRED TO AVOID LOCKS
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  db.pragma("foreign_keys = ON");

  // TABLES

  /**----------------------------------
     Items Table
   ---------------------------------*/
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS items (
      itemID TEXT PRIMARY KEY,
      itemName TEXT NOT NULL,
      unit TEXT NOT NULL,
      price REAL,
      hasVariants INTEGER NOT NULL
    )
  `
  ).run();

  /**----------------------------------
     Item Vairents Table
   ---------------------------------*/
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS item_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      itemID TEXT NOT NULL,
      size TEXT NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (itemID) REFERENCES items(itemID) ON DELETE CASCADE
    )
  `
  ).run();

  /**----------------------------------
     Size Table
   ---------------------------------*/
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS sizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      size INTEGER UNIQUE
    )
  `
  ).run();

  /**----------------------------------
     Bill Table
   ---------------------------------*/
  db.prepare(
    `
  CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_pieces INTEGER,
    total_before_discount REAL,
    discount REAL,
    discount_amount REAL,
    total_after_discount REAL,
    payment_mode TEXT
  )
`
  ).run();

  /**----------------------------------
     Bill Items Table
   ---------------------------------*/
  db.prepare(
    `
  CREATE TABLE IF NOT EXISTS bill_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER,
    item_code TEXT,
    item_name TEXT,
    price REAL,
    size TEXT,
    quantity INTEGER,
    total_amount REAL
  )
`
  ).run();

  /**----------------------------------
   Vendor Table
----------------------------------*/
  db.prepare(
    `
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
  )
`
  ).run();

  return db;
}

module.exports = { initDatabase };
