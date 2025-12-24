const { ipcMain } = require("electron");

function registerItemHandlers(db) {

  /** -----------------------
   * GET ALL ITEMS
   * ----------------------- */
  ipcMain.handle("db:getItems", () => {
    try {
      const rows = db.prepare(`
        SELECT 
          i.*, 
          v.vendorName, 
          iv.id AS variantId,
          iv.size AS variantSize,
          iv.sellingPrice AS variantSellingPrice,
          iv.purchaseId AS variantPurchaseId
        FROM items i
        LEFT JOIN vendors v ON i.vendorId = v.id
        LEFT JOIN item_variants iv ON i.itemID = iv.itemID
        ORDER BY i.itemName
      `).all();

      const itemsMap = new Map();
      for (const row of rows) {
        if (!itemsMap.has(row.itemID)) {
          itemsMap.set(row.itemID, {
            ...row,
            hasVariants: Boolean(row.hasVariants),
            variants: []
          });
        }

        if (row.variantId) {
          itemsMap.get(row.itemID).variants.push({
            id: row.variantId,
            size: row.variantSize,
            sellingPrice: row.variantSellingPrice,
            purchaseId: row.variantPurchaseId
          });
        }
      }

      return { success: true, items: Array.from(itemsMap.values()) };
    } catch (err) {
      return { success: false, code: "DB_ERROR", error: err.message };
    }
  });

  /** -----------------------
   * FILTER ITEMS
   * ----------------------- */
  ipcMain.handle("db:filterItems", (e, filters) => {
    try {
      let query = `
        SELECT 
          i.*, 
          v.vendorName, 
          iv.id AS variantId,
          iv.size AS variantSize,
          iv.sellingPrice AS variantSellingPrice,
          iv.purchaseId AS variantPurchaseId
        FROM items i
        LEFT JOIN vendors v ON i.vendorId = v.id
        LEFT JOIN item_variants iv ON i.itemID = iv.itemID
        WHERE 1=1
      `;
      const params = [];

      if (filters.itemName) {
        query += " AND i.itemName LIKE ?";
        params.push(`%${filters.itemName}%`);
      }
      if (filters.unit) {
        query += " AND i.unit = ?";
        params.push(filters.unit);
      }
      if (filters.hasVariants !== undefined) {
        query += " AND i.hasVariants = ?";
        params.push(filters.hasVariants ? 1 : 0);
      }
      if (filters.vendorId) {
        query += " AND i.vendorId = ?";
        params.push(filters.vendorId);
      }
      if (filters.purchaseId) {
        query += " AND i.purchaseId = ?";
        params.push(filters.purchaseId);
      }

      const rows = db.prepare(query).all(...params);

      const itemsMap = new Map();
      for (const row of rows) {
        if (!itemsMap.has(row.itemID)) {
          itemsMap.set(row.itemID, {
            ...row,
            hasVariants: Boolean(row.hasVariants),
            variants: []
          });
        }

        if (row.variantId) {
          itemsMap.get(row.itemID).variants.push({
            id: row.variantId,
            size: row.variantSize,
            sellingPrice: row.variantSellingPrice,
            purchaseId: row.variantPurchaseId
          });
        }
      }

      return { success: true, items: Array.from(itemsMap.values()) };
    } catch (err) {
      return { success: false, code: "DB_ERROR", error: err.message };
    }
  });

  /** -----------------------
   * INSERT ITEM
   * ----------------------- */
  const insertItemTx = db.transaction((item) => {
    db.prepare(`
      INSERT INTO items 
      (itemID, itemName, unit, purchaseRate, purchaseDate, sellingPrice, vendorId, purchaseId, hasVariants)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      item.itemID,
      item.itemName,
      item.unit,
      item.purchaseRate,
      item.purchaseDate,
      item.hasVariants ? null : item.sellingPrice,
      item.vendorId !== undefined ? parseInt(item.vendorId, 10) : null,
      item.purchaseId !== undefined ? item.purchaseId : null,
      item.hasVariants ? 1 : 0
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

  ipcMain.handle("db:insertItem", (e, item) => {
    try {
      const exists = db.prepare("SELECT 1 FROM items WHERE itemID = ?").get(item.itemID);
      if (exists) return { success: false, error: "ITEM_ID_EXISTS" };

      insertItemTx(item);
      return { success: true, message: "Item added successfully" };
    } catch (err) {
      return { success: false, code: "DB_ERROR", error: err.message };
    }
  });

  /** -----------------------
   * UPDATE ITEM
   * ----------------------- */
  const updateItemTx = db.transaction((item) => {
    const vendorId = item.vendorId !== undefined && item.vendorId !== null
      ? parseInt(item.vendorId, 10)
      : null;

    db.prepare(`
      UPDATE items
      SET itemName = ?, unit = ?, purchaseRate = ?, purchaseDate = ?,
          sellingPrice = ?, vendorId = ?, purchaseId = ?, hasVariants = ?
      WHERE itemID = ?
    `).run(
      item.itemName,
      item.unit,
      item.purchaseRate,
      item.purchaseDate,
      item.hasVariants ? null : item.sellingPrice,
      vendorId,
      item.purchaseId !== undefined ? item.purchaseId : null,
      item.hasVariants ? 1 : 0,
      item.itemID
    );

    db.prepare(`DELETE FROM item_variants WHERE itemID = ?`).run(item.itemID);

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

  ipcMain.handle("db:updateItem", (e, item) => {
    try {
      const exists = db.prepare("SELECT 1 FROM items WHERE itemID = ?").get(item.itemID);
      if (!exists) return { success: false, error: "ITEM_NOT_FOUND" };

      updateItemTx(item);
      return { success: true, message: "Item updated successfully" };
    } catch (err) {
      return { success: false, code: "DB_ERROR", error: err.message };
    }
  });

  /** -----------------------
   * DELETE ITEM
   * ----------------------- */
  ipcMain.handle("db:deleteItem", (e, itemID) => {
    try {
      db.prepare("DELETE FROM items WHERE itemID = ?").run(itemID);
      return { success: true, message: "Item deleted successfully" };
    } catch (err) {
      return { success: false, code: "DB_ERROR", error: err.message };
    }
  });

}

module.exports = { registerItemHandlers };
