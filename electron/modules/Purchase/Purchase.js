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
          WHEN i.hasVariants = 1 THEN iv.sellingPrice * iv.quantity
          ELSE i.purchaseRate * i.quantity
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
        .prepare(`SELECT * FROM purchases WHERE id=?`)
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

  /** -----------------------
   * ADD PURCHASE ITEM
   * ----------------------- */
  const insertItemTx = db.transaction((item) => {
    db.prepare(
      `
      INSERT INTO items 
      (itemID, itemName, unit, purchaseRate, purchaseDate, sellingPrice, vendorId, purchaseId, hasVariants, quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      item.hasVariants ? 0 : item.quantity || 0,
    );

    if (item.hasVariants && Array.isArray(item.variants)) {
      const stmt = db.prepare(`
        INSERT INTO item_variants (itemID, size, sellingPrice, quantity, purchaseId)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const v of item.variants) {
        stmt.run(
          item.itemID,
          v.size,
          v.sellingPrice,
          v.quantity || 0,
          v.purchaseId || null,
        );
      }
    }

    // Update purchase total after adding item
    updatePurchaseTotal(db, item.purchaseId);
  });

  ipcMain.handle("db:insertPurchaseItem", (e, item) => {
    try {
      const purchaseId = item.purchaseId;

      const SQL = `
      SELECT
        i.*,
        v.vendorName,
        iv.id AS variantId,
        iv.size AS variantSize,
        iv.sellingPrice AS variantSellingPrice,
        iv.quantity AS variantQuantity,
        iv.purchaseId AS variantPurchaseId
      FROM items i
      LEFT JOIN vendors v ON i.vendorId = v.id
      LEFT JOIN item_variants iv ON i.itemID = iv.itemID
      WHERE i.purchaseID = ?
      ORDER BY i.itemName
    `;

      const fetchPurchaseItems = (purchaseId) => {
        const rows = db.prepare(SQL).all(purchaseId);
        const itemsMap = new Map();

        for (const row of rows) {
          if (!itemsMap.has(row.itemID)) {
            itemsMap.set(row.itemID, {
              ...row,
              hasVariants: row.hasVariants === 1,
              variants: [],
            });
          }

          if (row.variantId) {
            itemsMap.get(row.itemID).variants.push({
              id: row.variantId,
              size: row.variantSize,
              sellingPrice: row.variantSellingPrice,
              quantity: row.variantQuantity || 0,
            });
          }
        }

        return Array.from(itemsMap.values());
      };

      // FETCH ONLY
      if (item.fetchOnly) {
        const data = fetchPurchaseItems(purchaseId);
        return { success: true, data };
      }

      // CHECK ITEM EXISTS
      const exists = db
        .prepare("SELECT 1 FROM items WHERE itemID = ?")
        .get(item.itemID);

      if (exists) {
        return { success: false, error: "ITEM_ID_EXISTS" };
      }

      // INSERT ITEM (transaction assumed)
      insertItemTx(item);

      // FETCH UPDATED LIST
      const data = fetchPurchaseItems(purchaseId);

      return { success: true, data };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  });

  /** -----------------------
   * UPDATE PURCHASE ITEM
   * ----------------------- */
  const updateItemTx = db.transaction((item) => {
    db.prepare(
      `
      UPDATE items
      SET itemName = ?, unit = ?, purchaseRate = ?, purchaseDate = ?, sellingPrice = ?, quantity = ?
      WHERE itemID = ?
    `,
    ).run(
      item.itemName,
      item.unit,
      item.purchaseRate,
      item.purchaseDate,
      item.hasVariants ? null : item.sellingPrice,
      item.hasVariants ? 0 : item.quantity || 0,
      item.itemID,
    );

    // Update variants if any
    if (item.hasVariants && Array.isArray(item.variants)) {
      db.prepare(`DELETE FROM item_variants WHERE itemID = ?`).run(item.itemID);
      const stmt = db.prepare(`
        INSERT INTO item_variants (itemID, size, sellingPrice, quantity, purchaseId)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const v of item.variants) {
        stmt.run(
          item.itemID,
          v.size,
          v.sellingPrice,
          v.quantity || 0,
          v.purchaseId || null,
        );
      }
    }

    // Update purchase total
    updatePurchaseTotal(db, item.purchaseId);
  });

  ipcMain.handle("db:updatePurchaseItem", (e, item) => {
    try {
      const exists = db
        .prepare("SELECT 1 FROM items WHERE itemID = ?")
        .get(item.itemID);
      if (!exists) return { success: false, error: "ITEM_NOT_FOUND" };

      updateItemTx(item);

      return { success: true, message: "Purchase item updated successfully" };
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
          iv.sellingPrice AS variantSellingPrice,
          iv.quantity AS variantQuantity
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
            quantity: row.variantQuantity || 0,
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
   * GET PURCHASE LIST
   * ----------------------- */
  ipcMain.handle("db:getPurchaseList", () => {
    try {
      const purchases = db
        .prepare(
          `
        SELECT p.*, v.vendorName
        FROM purchases p
        LEFT JOIN vendors v ON v.id = p.vendorId
        ORDER BY p.id DESC
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

  /** -----------------------
   * GET PURCHASE LIST CURSOR (for pagination)
   * ----------------------- */
  ipcMain.handle(
    "db:getPurchaseListCursor",
    (e, { lastId = Number.MAX_SAFE_INTEGER, pageSize = 20 }) => {
      try {
        const purchases = db
          .prepare(
            `
          SELECT 
            p.id,
            p.purchaseDate,
            p.vendorId,
            p.totalAmount,
            p.remarks,
            p.created_at,
            v.vendorName
          FROM purchases p
          LEFT JOIN vendors v ON v.id = p.vendorId
          WHERE p.id < ?
          ORDER BY p.id DESC
          LIMIT ?
        `,
          )
          .all(lastId, pageSize);

        const nextCursor =
          purchases.length > 0 ? purchases[purchases.length - 1].id : null;

        return {
          success: true,
          data: purchases,
          nextCursor: purchases.length < pageSize ? null : nextCursor,
        };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
  );

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
   * GET ALL PURCHASE ITEM LIST BY ID for LABEL
   * ----------------------- */
  ipcMain.handle("db:getItemsByPurchaseIds", (e, { purchaseIds }) => {
    try {
      if (!purchaseIds || !purchaseIds.length) {
        return { success: true, data: [] };
      }

      const placeholders = purchaseIds.map(() => "?").join(",");

      const SQL = `
      SELECT
        i.*,
        v.vendorName,
        iv.id AS variantId,
        iv.size AS variantSize,
        iv.sellingPrice AS variantSellingPrice,
        iv.quantity AS variantQuantity,
        iv.purchaseId AS variantPurchaseId
      FROM items i
      LEFT JOIN vendors v ON i.vendorId = v.id
      LEFT JOIN item_variants iv ON i.itemID = iv.itemID
      WHERE i.purchaseId IN (${placeholders})
      ORDER BY i.itemName
    `;

      const rows = db.prepare(SQL).all(...purchaseIds);

      const itemsMap = new Map();

      for (const row of rows) {
        if (!itemsMap.has(row.itemID)) {
          itemsMap.set(row.itemID, {
            ...row,
            hasVariants: row.hasVariants === 1,
            variants: [],
          });
        }

        if (row.variantId) {
          itemsMap.get(row.itemID).variants.push({
            id: row.variantId,
            size: row.variantSize,
            sellingPrice: row.variantSellingPrice,
            quantity: row.variantQuantity || 0,
          });
        }
      }

      return {
        success: true,
        data: Array.from(itemsMap.values()),
      };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  });
}

module.exports = { registerPurchaseHandlers };
