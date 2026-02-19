const path = require("path");
const Database = require("better-sqlite3");
const { app } = require("electron");
const {
  purchaseSchema,
  vendorSchema,
  billItemSchema,
  discountSchema,
  billSchema,
  sizeSchema,
  itemVariantSchema,
  itemSchema,
  settingSchema,
  customerSchema,
  userSchema,
  roleSchema,
  permissionSchema,
  moduleSchema,
  formSchema,
} = require("./schema");

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
  db.prepare(settingSchema).run();

  /* ---------------- ITEMS ---------------- */
  db.prepare(itemSchema).run();

  /* ---------------- ITEM VARIANTS ---------------- */
  db.prepare(itemVariantSchema).run();

  /* ---------------- SIZES ---------------- */
  db.prepare(sizeSchema).run();

  /* ---------------- BILLS ---------------- */
  db.prepare(billSchema).run();

  /* ---------------- BILL ITEMS ---------------- */
  db.prepare(billItemSchema).run();

  /* ---------------- VENDORS ---------------- */
  db.prepare(vendorSchema).run();

  /* ---------------- PURCHASES ---------------- */
  db.prepare(purchaseSchema).run();

  /* ---------------- DISCOUNTS ---------------- */
  db.prepare(discountSchema).run();

  /* ---------------- CUSTOMER ---------------- */
  db.prepare(customerSchema).run();

  /* ---------------- User ---------------- */
  db.prepare(userSchema).run();

  /* ---------------- Role ---------------- */
  db.prepare(roleSchema).run();

  /* ---------------- Permission ---------------- */
  db.prepare(permissionSchema).run();

  /* ---------------- moduleSchema ---------------- */
  db.exec(moduleSchema);

  /* ---------------- formSchema ---------------- */
  db.prepare(formSchema).run();

  console.log("✅ Database initialized successfully");

  return db;
}

module.exports = { initDatabase };
