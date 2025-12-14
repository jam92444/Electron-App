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

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS sizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      size INTEGER UNIQUE
    )
  `
  ).run();

  return db;
}

module.exports = { initDatabase };
