const { ipcMain } = require("electron");

/** -----------------------
 * HELPER: UPDATE PURCHASE TOTAL
 * ----------------------- */
function updatePurchaseTotal(db, purchaseId) {
  const row = db
    .prepare(
      `
    SELECT 
      SUM(
        CASE 
          WHEN i.hasVariants = 1 THEN iv.sellingPrice
          ELSE i.purchaseRate
        END
      ) AS total
    FROM items i
    LEFT JOIN item_variants iv ON i.itemID = iv.itemID
    WHERE i.purchaseId = ?
  `,
    )
    .get(purchaseId);

  db.prepare(
    `
    UPDATE purchases
    SET totalAmount = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
  ).run(row?.total || 0, purchaseId);
}

function registerPurchaseHandlers(db) {
  /** -----------------------
   * CREATE PURCHASE
   * ----------------------- */
  ipcMain.handle("db:createPurchase", (e, purchase) => {
    try {
      const result = db
        .prepare(
          `
        INSERT INTO purchases (purchaseDate, vendorId, remarks)
        VALUES (?, ?, ?)
      `,
        )
        .run(
          purchase.purchaseDate,
          parseInt(purchase.vendorId, 10),
          purchase.remarks || "",
        );
      const data = db
        .prepare(` SELECT * FROM purchases WHERE id=?`)
        .get(result.lastInsertRowid);
      return {
        success: true,
        purchaseId: result.lastInsertRowid,
        data,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* -------- ADD PURCHASE ITEM --------- */
  const insertItemTx = db.transaction((item) => {
    db.prepare(
      `
      INSERT INTO items 
      (itemID, itemName, unit, purchaseRate, purchaseDate, sellingPrice, vendorId, purchaseId, hasVariants)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      item.itemID,
      item.itemName,
      item.unit,
      item.purchaseRate,
      item.purchaseDate,
      item.hasVariants ? null : item.sellingPrice,
      item.vendorId !== undefined ? parseInt(item.vendorId, 10) : null,
      item.purchaseId !== undefined ? item.purchaseId : null,
      item.hasVariants ? 1 : 0,
    );

    if (item.hasVariants && Array.isArray(item.variants)) {
      const stmt = db.prepare(`
        INSERT INTO item_variants (itemID, size, sellingPrice, purchaseId)
        VALUES (?, ?, ?, ?)
      `);
      for (const v of item.variants) {
        stmt.run(item.itemID, v.size, v.sellingPrice, v.purchaseId || null);
      }
    }
  });

  ipcMain.handle("db:insertPurchaseItem", (e, item) => {
    try {
      if (item.fetchOnly) {
        const list = db
          .prepare("SELECT * FROM items WHERE purchaseID = ?")
          .all(item.purchaseId);

        return { success: true, data: list };
      }

      const exists = db
        .prepare("SELECT 1 FROM items WHERE itemID = ?")
        .get(item.itemID);

      if (exists) return { success: false, error: "ITEM_ID_EXISTS" };

      insertItemTx(item);

      const purchaseItemList = db
        .prepare("SELECT * FROM items WHERE purchaseID = ?")
        .all(item.purchaseId);

      return { success: true, data: purchaseItemList };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /** -----------------------
   * GET PURCHASE BY ID
   * ----------------------- */
  ipcMain.handle("db:getPurchaseById", (e, purchaseId) => {
    try {
      const purchase = db
        .prepare(
          `
        SELECT p.*, v.vendorName
        FROM purchases p
        JOIN vendors v ON p.vendorId = v.id
        WHERE p.id = ?
      `,
        )
        .get(purchaseId);

      if (!purchase) {
        return { success: false, error: "PURCHASE_NOT_FOUND" };
      }

      const rows = db
        .prepare(
          `
        SELECT 
          i.*, 
          iv.id AS variantId,
          iv.size,
          iv.sellingPrice AS variantSellingPrice
        FROM items i
        LEFT JOIN item_variants iv ON i.itemID = iv.itemID
        WHERE i.purchaseId = ?
      `,
        )
        .all(purchaseId);

      const itemsMap = new Map();

      for (const row of rows) {
        if (!itemsMap.has(row.itemID)) {
          itemsMap.set(row.itemID, {
            ...row,
            hasVariants: Boolean(row.hasVariants),
            variants: [],
          });
        }

        if (row.variantId) {
          itemsMap.get(row.itemID).variants.push({
            id: row.variantId,
            size: row.size,
            sellingPrice: row.variantSellingPrice,
          });
        }
      }

      return {
        success: true,
        purchase,
        items: Array.from(itemsMap.values()),
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /** -----------------------
   * GET PURCHASE BY ID
   * ----------------------- */
  ipcMain.handle("db:getPurchaseList", () => {
    try {
      const purchases = db
        .prepare(
          `
        SELECT *
        FROM purchases
        ORDER BY id DESC
        `,
        )
        .all();

      return {
        success: true,
        data: purchases,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /** -----------------------
   * UPDATE PURCHASE INFO
   * ----------------------- */
  ipcMain.handle("db:updatePurchase", (e, purchase) => {
    try {
      db.prepare(
        `
        UPDATE purchases
        SET purchaseDate = ?, vendorId = ?, remarks = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      ).run(
        purchase.purchaseDate,
        purchase.vendorId,
        purchase.remarks || "",
        purchase.id,
      );

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /** -----------------------
   * DELETE PURCHASE
   * ----------------------- */
  ipcMain.handle("db:deletePurchase", (e, purchaseId) => {
    try {
      db.prepare(`DELETE FROM purchases WHERE id = ?`).run(purchaseId);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

module.exports = { registerPurchaseHandlers, updatePurchaseTotal };
