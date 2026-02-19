const { ipcMain } = require("electron");

function registerDashboardHandlers(db) {
  /* -----------------------
   * DASHBOARD SUMMARY
   * ----------------------- */
  ipcMain.handle("db:getDashboardSummary", () => {
    try {
      const summary = {
        totalVendors: db.prepare(`SELECT COUNT(*) AS c FROM vendors`).get().c,
        totalPurchases: db.prepare(`SELECT COUNT(*) AS c FROM purchases`).get()
          .c,
        totalPurchaseAmount: db
          .prepare(`SELECT COALESCE(SUM(totalAmount),0) AS t FROM purchases`)
          .get().t,
        totalItems: db.prepare(`SELECT COUNT(*) AS c FROM items`).get().c,
        totalStock: db
          .prepare(
            `
            SELECT COALESCE(SUM(quantity),0) AS q
            FROM items WHERE hasVariants = 0
          `,
          )
          .get().q,
      };

      return { success: true, data: summary };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* -----------------------
   * PURCHASE TREND (7 / 30 days)
   * ----------------------- */
  ipcMain.handle("db:getPurchaseTrend", (e, days = 7) => {
    try {
      const rows = db
        .prepare(
          `
        SELECT 
          DATE(purchaseDate) AS date,
          SUM(totalAmount) AS total
        FROM purchases
        WHERE purchaseDate >= DATE('now', ?)
        GROUP BY DATE(purchaseDate)
        ORDER BY date ASC
      `,
        )
        .all(`-${days} days`);

      return { success: true, data: rows };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* -----------------------
   * TOP VENDORS
   * ----------------------- */
  ipcMain.handle("db:getTopVendors", () => {
    try {
      const rows = db
        .prepare(
          `
        SELECT 
          v.vendorName,
          SUM(p.totalAmount) AS total
        FROM purchases p
        JOIN vendors v ON v.id = p.vendorId
        GROUP BY p.vendorId
        ORDER BY total DESC
        LIMIT 5
      `,
        )
        .all();

      return { success: true, data: rows };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* -----------------------
   * RECENT PURCHASES
   * ----------------------- */
  ipcMain.handle("db:getRecentPurchases", () => {
    try {
      const rows = db
        .prepare(
          `
        SELECT 
          p.id,
          p.purchaseDate,
          p.totalAmount,
          v.vendorName
        FROM purchases p
        JOIN vendors v ON v.id = p.vendorId
        ORDER BY p.created_at DESC
        LIMIT 10
      `,
        )
        .all();

      return { success: true, data: rows };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* -----------------------
   * LOW STOCK ITEMS
   * ----------------------- */
  ipcMain.handle("db:getLowStockItems", () => {
    try {
      const rows = db
        .prepare(
          `
       -- Low stock items including variants
SELECT *
FROM (
    -- Items without variants
    SELECT 
        i.itemName AS itemName,
        i.quantity AS quantity,
        v.vendorName
    FROM items i
    LEFT JOIN vendors v ON v.id = i.vendorId
    WHERE i.hasVariants = 0 AND i.quantity <= 2

    UNION ALL

    -- Items with variants
    SELECT 
        i.itemName || ' - ' || iv.size AS itemName, -- include variant size
        iv.quantity AS quantity,
        v.vendorName
    FROM item_variants iv
    JOIN items i ON i.itemID = iv.itemID
    LEFT JOIN vendors v ON v.id = i.vendorId
    WHERE iv.quantity <= 2
)
ORDER BY quantity ASC
LIMIT 10;

      `,
        )
        .all();

      return { success: true, data: rows };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* -----------------------
   * VARIANT STOCK SUMMARY
   * ----------------------- */
  ipcMain.handle("db:getVariantStockSummary", () => {
    try {
      const rows = db
        .prepare(
          `
        SELECT
          i.itemName,
          iv.size,
          iv.quantity
        FROM item_variants iv
        JOIN items i ON i.itemID = iv.itemID
        ORDER BY iv.quantity DESC LIMIT 10
      `,
        )
        .all();

      return { success: true, data: rows };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* -----------------------
   * MONTHLY PURCHASE SUMMARY
   * ----------------------- */
  ipcMain.handle("db:getMonthlyPurchaseSummary", () => {
    try {
      const rows = db
        .prepare(
          `
        SELECT
          strftime('%Y-%m', purchaseDate) AS month,
          COUNT(*) AS purchaseCount,
          SUM(totalAmount) AS totalAmount
        FROM purchases
        GROUP BY month
        ORDER BY month DESC
      `,
        )
        .all();

      return { success: true, data: rows };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* -----------------------
   * VENDOR STATUS STATS
   * ----------------------- */
  ipcMain.handle("db:getVendorStatusStats", () => {
    try {
      const rows = db
        .prepare(
          `
        SELECT status, COUNT(*) AS count
        FROM vendors
        GROUP BY status
      `,
        )
        .all();

      return { success: true, data: rows };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* -----------------------
   * MASTER DASHBOARD DATA
   * ----------------------- */
  ipcMain.handle("db:getDashboardData", () => {
    try {
      return {
        success: true,
        data: {
          summary: {
            totalVendors: db.prepare(`SELECT COUNT(*) AS c FROM vendors`).get()
              .c,
            totalPurchases: db
              .prepare(`SELECT COUNT(*) AS c FROM purchases`)
              .get().c,
            totalPurchaseAmount: db
              .prepare(
                `SELECT COALESCE(SUM(totalAmount),0) AS t FROM purchases`,
              )
              .get().t,
            totalItems: db.prepare(`SELECT COUNT(*) AS c FROM items`).get().c,
            totalStock: db
              .prepare(
                `SELECT COALESCE(SUM(quantity),0) AS q FROM items WHERE hasVariants = 0`,
              )
              .get().q,
          },
          purchaseTrend: db
            .prepare(
              `
            SELECT DATE(purchaseDate) AS date, SUM(totalAmount) AS total
            FROM purchases
            GROUP BY DATE(purchaseDate)
            ORDER BY date ASC
          `,
            )
            .all(),
          topVendors: db
            .prepare(
              `
            SELECT v.vendorName, SUM(p.totalAmount) AS total
            FROM purchases p
            JOIN vendors v ON v.id = p.vendorId
            GROUP BY p.vendorId
            ORDER BY total DESC
            LIMIT 5
          `,
            )
            .all(),
          recentPurchases: db
            .prepare(
              `
            SELECT p.id, p.purchaseDate, p.totalAmount, v.vendorName
            FROM purchases p
            JOIN vendors v ON v.id = p.vendorId
            ORDER BY p.created_at DESC
            LIMIT 10
          `,
            )
            .all(),
          lowStock: db
            .prepare(
              `
            SELECT i.itemName, i.quantity, v.vendorName
            FROM items i
            LEFT JOIN vendors v ON v.id = i.vendorId
            WHERE i.hasVariants = 0 AND i.quantity <= 1 
          `,
            )
            .all(),
        },
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

module.exports = { registerDashboardHandlers };
