const { ipcMain } = require("electron");

function registerDashboardHandlers(db) {
  // ─── Helper: build WHERE/AND clause for optional date range ─────────────
  const dateClause = (column, startDate, endDate, existingWhere = false) => {
    const keyword = existingWhere ? "AND" : "WHERE";
    if (startDate && endDate)
      return {
        clause: `${keyword} ${column} BETWEEN ? AND ?`,
        params: [startDate, endDate],
      };
    if (startDate)
      return { clause: `${keyword} ${column} >= ?`, params: [startDate] };
    if (endDate)
      return { clause: `${keyword} ${column} <= ?`, params: [endDate] };
    return { clause: "", params: [] };
  };

  /* -----------------------
   * DASHBOARD SUMMARY
   * ----------------------- */
  ipcMain.handle("db:getDashboardSummary", (e, { startDate, endDate } = {}) => {
    try {
      const { clause, params } = dateClause("purchaseDate", startDate, endDate);

      const summary = {
        totalVendors: db.prepare(`SELECT COUNT(*) AS c FROM vendors`).get().c,
        totalItems: db.prepare(`SELECT COUNT(*) AS c FROM items`).get().c,
        totalStock: db
          .prepare(
            `SELECT COALESCE(SUM(quantity),0) AS q FROM items WHERE hasVariants = 0`,
          )
          .get().q,
        totalPurchases: db
          .prepare(`SELECT COUNT(*) AS c FROM purchases ${clause}`)
          .get(...params).c,
        totalPurchaseAmount: db
          .prepare(
            `SELECT COALESCE(SUM(totalAmount),0) AS t FROM purchases ${clause}`,
          )
          .get(...params).t,
      };

      return { success: true, data: summary };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* -----------------------
   * PURCHASE TREND
   * ----------------------- */
  ipcMain.handle(
    "db:getPurchaseTrend",
    (e, { days = 30, startDate, endDate } = {}) => {
      try {
        let query, params;

        if (startDate || endDate) {
          const { clause, params: p } = dateClause(
            "purchaseDate",
            startDate,
            endDate,
          );
          query = `
          SELECT DATE(purchaseDate) AS date, SUM(totalAmount) AS total
          FROM purchases
          ${clause}
          GROUP BY DATE(purchaseDate)
          ORDER BY date ASC
        `;
          params = p;
        } else {
          query = `
          SELECT DATE(purchaseDate) AS date, SUM(totalAmount) AS total
          FROM purchases
          WHERE purchaseDate >= DATE('now', ?)
          GROUP BY DATE(purchaseDate)
          ORDER BY date ASC
        `;
          params = [`-${Math.abs(parseInt(days))} days`]; // sanitized
        }

        return { success: true, data: db.prepare(query).all(...params) };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
  );

  /* -----------------------
   * TOP VENDORS
   * ----------------------- */
  ipcMain.handle(
    "db:getTopVendors",
    (e, { startDate, endDate, limit = 5 } = {}) => {
      try {
        const { clause, params } = dateClause(
          "p.purchaseDate",
          startDate,
          endDate,
        );
        const safeLimit = Math.min(Math.abs(parseInt(limit) || 5), 50); // cap at 50

        const rows = db
          .prepare(
            `
        SELECT
          v.vendorName,
          SUM(p.totalAmount) AS total,
          COUNT(p.id) AS purchaseCount
        FROM purchases p
        JOIN vendors v ON v.id = p.vendorId
        ${clause}
        GROUP BY p.vendorId
        ORDER BY total DESC
        LIMIT ?
      `,
          )
          .all(...params, safeLimit); // ✅ limit as bound param

        return { success: true, data: rows };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
  );

  /* -----------------------
   * RECENT PURCHASES
   * ----------------------- */
  ipcMain.handle(
    "db:getRecentPurchases",
    (e, { startDate, endDate, limit = 10 } = {}) => {
      try {
        const { clause, params } = dateClause(
          "p.purchaseDate",
          startDate,
          endDate,
        );
        const safeLimit = Math.min(Math.abs(parseInt(limit) || 10), 100); // cap at 100

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
        ${clause}
        ORDER BY p.created_at DESC
        LIMIT ?
      `,
          )
          .all(...params, safeLimit); // ✅ limit as bound param

        return { success: true, data: rows };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
  );

  /* -----------------------
   * LOW STOCK ITEMS
   * ----------------------- */
  ipcMain.handle("db:getLowStockItems", (e, { threshold = 2 } = {}) => {
    try {
      const safeThreshold = Math.abs(parseInt(threshold) || 2);

      const rows = db
        .prepare(
          `
        SELECT * FROM (
          SELECT
            i.itemName,
            i.quantity,
            v.vendorName
          FROM items i
          LEFT JOIN vendors v ON v.id = i.vendorId
          WHERE i.hasVariants = 0 AND i.quantity <= ?

          UNION ALL

          SELECT
            i.itemName || ' - ' || iv.size AS itemName,
            iv.quantity,
            v.vendorName
          FROM item_variants iv
          JOIN items i ON i.itemID = iv.itemID
          LEFT JOIN vendors v ON v.id = i.vendorId
          WHERE iv.quantity <= ?
        )
        ORDER BY quantity ASC
        LIMIT 20
      `,
        )
        .all(safeThreshold, safeThreshold); // ✅ both threshold params bound safely

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
        ORDER BY iv.quantity DESC
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
  ipcMain.handle(
    "db:getMonthlyPurchaseSummary",
    (e, { year, startDate, endDate } = {}) => {
      try {
        let clause = "";
        let params = [];

        if (startDate || endDate) {
          const d = dateClause("purchaseDate", startDate, endDate);
          clause = d.clause;
          params = d.params;
        } else if (year) {
          clause = `WHERE strftime('%Y', purchaseDate) = ?`;
          params = [String(parseInt(year))]; // sanitized
        }

        const rows = db
          .prepare(
            `
        SELECT
          strftime('%Y-%m', purchaseDate) AS month,
          COUNT(*) AS purchaseCount,
          SUM(totalAmount) AS totalAmount
        FROM purchases
        ${clause}
        GROUP BY month
        ORDER BY month ASC
      `,
          )
          .all(...params);

        return { success: true, data: rows };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
  );

  /* -----------------------
   * VENDOR STATUS STATS
   * ----------------------- */
  ipcMain.handle("db:getVendorStatusStats", () => {
    try {
      const rows = db
        .prepare(
          `SELECT status, COUNT(*) AS count FROM vendors GROUP BY status`,
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
  ipcMain.handle("db:getDashboardData", (e, { startDate, endDate } = {}) => {
    try {
      const { clause, params } = dateClause("purchaseDate", startDate, endDate);
      const { clause: pClause, params: pParams } = dateClause(
        "p.purchaseDate",
        startDate,
        endDate,
      );

      return {
        success: true,
        data: {
          summary: {
            totalVendors: db.prepare(`SELECT COUNT(*) AS c FROM vendors`).get()
              .c,
            totalItems: db.prepare(`SELECT COUNT(*) AS c FROM items`).get().c,
            totalStock: db
              .prepare(
                `SELECT COALESCE(SUM(quantity),0) AS q FROM items WHERE hasVariants = 0`,
              )
              .get().q,
            totalPurchases: db
              .prepare(`SELECT COUNT(*) AS c FROM purchases ${clause}`)
              .get(...params).c,
            totalPurchaseAmount: db
              .prepare(
                `SELECT COALESCE(SUM(totalAmount),0) AS t FROM purchases ${clause}`,
              )
              .get(...params).t,
          },
          purchaseTrend: db
            .prepare(
              `
            SELECT DATE(purchaseDate) AS date, SUM(totalAmount) AS total
            FROM purchases ${clause}
            GROUP BY DATE(purchaseDate)
            ORDER BY date ASC
          `,
            )
            .all(...params),
          topVendors: db
            .prepare(
              `
            SELECT v.vendorName, SUM(p.totalAmount) AS total, COUNT(p.id) AS purchaseCount
            FROM purchases p
            JOIN vendors v ON v.id = p.vendorId
            ${pClause}
            GROUP BY p.vendorId
            ORDER BY total DESC
            LIMIT 5
          `,
            )
            .all(...pParams),
          recentPurchases: db
            .prepare(
              `
            SELECT p.id, p.purchaseDate, p.totalAmount, v.vendorName
            FROM purchases p
            JOIN vendors v ON v.id = p.vendorId
            ${pClause}
            ORDER BY p.created_at DESC
            LIMIT 10
          `,
            )
            .all(...pParams),
          lowStock: db
            .prepare(
              `
            SELECT i.itemName, i.quantity, v.vendorName
            FROM items i
            LEFT JOIN vendors v ON v.id = i.vendorId
            WHERE i.hasVariants = 0 AND i.quantity <= 2
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
