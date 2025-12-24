const { ipcMain } = require("electron");

function registerPurchaseHandlers(db) {
  /* =========================
     CREATE PURCHASE
  ========================= */
  const insertPurchaseTx = db.transaction((purchase, items = []) => {
    if (!purchase.vendorId) {
      throw new Error("VENDOR_ID_REQUIRED");
    }

    const result = db.prepare(`
      INSERT INTO purchases (purchaseDate, vendorId, totalAmount, remarks)
      VALUES (?, ?, ?, ?)
    `).run(
      purchase.purchaseDate,
      parseInt(purchase.vendorId, 10),
      purchase.totalAmount || 0,
      purchase.remarks || ""
    );

    const purchaseId = result.lastInsertRowid;

    if (Array.isArray(items) && items.length) {
      const itemStmt = db.prepare(`
        UPDATE items
        SET purchaseId = ?
        WHERE itemID = ? AND (purchaseId IS NULL OR purchaseId = ?)
      `);

      const variantStmt = db.prepare(`
        UPDATE item_variants
        SET purchaseId = ?
        WHERE id = ? AND (purchaseId IS NULL OR purchaseId = ?)
      `);

      for (const item of items) {
        if (item.itemID) itemStmt.run(purchaseId, item.itemID, purchaseId);
        if (item.variantId) variantStmt.run(purchaseId, item.variantId, purchaseId);
      }
    }

    return purchaseId;
  });

  ipcMain.handle("db:createPurchase", (e, purchase, items) => {
    try {
      const purchaseId = insertPurchaseTx(purchase, items);
      return { success: true, purchaseId, message: "Purchase created successfully." };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* =========================
     UPDATE PURCHASE
  ========================= */
  const updatePurchaseTx = db.transaction((purchaseId, purchase, items = []) => {
    if (!purchase.vendorId) {
      throw new Error("VENDOR_ID_REQUIRED");
    }

    db.prepare(`
      UPDATE purchases
      SET purchaseDate = ?, vendorId = ?, totalAmount = ?, remarks = ?
      WHERE id = ?
    `).run(
      purchase.purchaseDate,
      parseInt(purchase.vendorId, 10),
      purchase.totalAmount || 0,
      purchase.remarks || "",
      purchaseId
    );

    // Remove previous links
    db.prepare(`UPDATE items SET purchaseId = NULL WHERE purchaseId = ?`).run(purchaseId);
    db.prepare(`UPDATE item_variants SET purchaseId = NULL WHERE purchaseId = ?`).run(purchaseId);

    // Re-assign selected items/variants
    if (Array.isArray(items) && items.length) {
      const itemStmt = db.prepare(`
        UPDATE items
        SET purchaseId = ?
        WHERE itemID = ?
      `);
      const variantStmt = db.prepare(`
        UPDATE item_variants
        SET purchaseId = ?
        WHERE id = ?
      `);

      for (const item of items) {
        if (item.itemID) itemStmt.run(purchaseId, item.itemID);
        if (item.variantId) variantStmt.run(purchaseId, item.variantId);
      }
    }
  });

  ipcMain.handle("db:updatePurchase", (e, purchaseId, purchase, items) => {
    try {
      const exists = db.prepare("SELECT 1 FROM purchases WHERE id = ?").get(purchaseId);
      if (!exists) return { success: false, error: "PURCHASE_NOT_FOUND" };

      updatePurchaseTx(purchaseId, purchase, items);
      return { success: true, message: "Purchase updated successfully." };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* =========================
     DELETE PURCHASE
  ========================= */
  ipcMain.handle("db:deletePurchase", (e, purchaseId) => {
    try {
      db.prepare(`UPDATE items SET purchaseId = NULL WHERE purchaseId = ?`).run(purchaseId);
      db.prepare(`UPDATE item_variants SET purchaseId = NULL WHERE purchaseId = ?`).run(purchaseId);

      const result = db.prepare(`DELETE FROM purchases WHERE id = ?`).run(purchaseId);
      if (result.changes === 0) {
        return { success: false, error: "PURCHASE_NOT_FOUND", message: "Purchase not found." };
      }

      return { success: true, message: "Purchase deleted successfully." };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* =========================
     GET ALL PURCHASES
  ========================= */
  ipcMain.handle("db:getPurchases", () => {
    try {
      const purchases = db.prepare(`
        SELECT p.*, v.vendorName
        FROM purchases p
        LEFT JOIN vendors v ON p.vendorId = v.id
        ORDER BY p.purchaseDate DESC
      `).all();

      return { success: true, purchases };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* =========================
     GET PURCHASE BY ID
  ========================= */
  ipcMain.handle("db:getPurchaseById", (e, purchaseId) => {
    try {
      const purchase = db.prepare(`SELECT * FROM purchases WHERE id = ?`).get(purchaseId);
      if (!purchase) return { success: false, error: "PURCHASE_NOT_FOUND" };

      const items = db.prepare(`SELECT * FROM items WHERE purchaseId = ?`).all(purchaseId);
      const variants = db.prepare(`SELECT * FROM item_variants WHERE purchaseId = ?`).all(purchaseId);

      return { success: true, purchase, items, variants };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

module.exports = { registerPurchaseHandlers };
