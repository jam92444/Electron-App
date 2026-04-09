const path = require("path");
const Database = require("better-sqlite3");
const { app } = require("electron");
const fullSchema = require("./schema");
const fs = require("fs");

let db;

function initDatabase() {
  if (db) return db;

  const dbPath = path.join(app.getPath("userData"), "app.db");
  db = new Database(dbPath);

  // WAL mode + busy timeout
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  db.pragma("foreign_keys = ON");

  try {
    db.prepare(
      `ALTER TABLE bills ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
    ).run();
  } catch (e) {} // column exists, ignore

  try {
    const tableCheck = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='bills'")
      .get();
    if (!tableCheck) db.exec(fullSchema);
  } catch (err) {
    console.error("Failed to initialize DB:", err);
  }

  return db;
}

// ================= CONFIG PATH =================
const configPath = path.join(app.getPath("userData"), "config.json");

// Save user-selected backup folder
function saveBackupPath(folderPath) {
  fs.writeFileSync(configPath, JSON.stringify({ backupPath: folderPath }));
}

// Get user-selected backup folder
function getBackupPath() {
  if (!fs.existsSync(configPath)) return null;
  const data = JSON.parse(fs.readFileSync(configPath));
  return data.backupPath || null;
}

// ================= BACKUP =================
async function backupDatabase() {
  if (!db) throw new Error("DB not initialized");

  const customPath = getBackupPath();
  const backupDir = customPath || path.join(app.getPath("documents"), "InviOX_Backups");

  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDir, `backup-${timestamp}.db`);

  try {
    await db.backup(backupPath);
    console.log("Backup created at:", backupPath);
    return { success: true, path: backupPath };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = {
  initDatabase,
  backupDatabase,
  saveBackupPath,
  getBackupPath,
};