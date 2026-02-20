const path = require("path");
const Database = require("better-sqlite3");
const { app } = require("electron");
const fullSchema = require("./schema");

let db;

function initDatabase() {
  if (db) return db;

  const dbPath = path.join(app.getPath("userData"), "app.db");

  // Open DB connection
  db = new Database(dbPath);

  // WAL mode + busy timeout
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000"); // waits 5 seconds if DB is locked
  db.pragma("foreign_keys = ON");

  try {
    // Execute full schema only if tables do not exist
    db.exec(fullSchema);
    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Failed to initialize DB:", err);
  }

  return db;
}

module.exports = { initDatabase };
