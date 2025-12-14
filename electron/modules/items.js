const { ipcMain } = require("electron");

function registerItemHandlers(db) {
  // ---------- GET ITEMS ----------
  ipcMain.handle("db:getItems", () => {
    try {
      const items = db.prepare(`SELECT * FROM items`).all();
      const variants = db.prepare(`SELECT * FROM item_variants`).all();

      const merged = items.map((item) => ({
        ...item,
        hasVariants: !!item.hasVariants,
        variants: variants.filter((v) => v.itemID === item.itemID),
      }));

      return { success: true, items: merged };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ---------- INSERT ITEM (TRANSACTION) ----------
  const insertItemTx = db.transaction((item) => {
    db.prepare(
      `
      INSERT INTO items (itemID, itemName, unit, price, hasVariants)
      VALUES (?, ?, ?, ?, ?)
    `
    ).run(
      item.itemID,
      item.itemName,
      item.unit,
      item.price || null,
      item.hasVariants ? 1 : 0
    );

    if (item.hasVariants) {
      const stmt = db.prepare(`
        INSERT INTO item_variants (itemID, size, price)
        VALUES (?, ?, ?)
      `);

      for (const v of item.variants) {
        stmt.run(item.itemID, v.size, v.price);
      }
    }
  });

  ipcMain.handle("db:insertItem", (e, item) => {
    try {
      const exists = db
        .prepare("SELECT 1 FROM items WHERE itemID = ?")
        .get(item.itemID);
      console.log(exists, "Item  ID exist");
      if (exists) {
        return { success: false, error: "ITEM_ID_EXISTS" };
      }

      insertItemTx(item);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ---------- UPDATE ITEM ----------
  const updateItemTx = db.transaction((item) => {
    db.prepare(
      `
      UPDATE items SET itemName = ?, unit = ?, price = ?, hasVariants = ?
      WHERE itemID = ?
    `
    ).run(
      item.itemName,
      item.unit,
      item.price || null,
      item.hasVariants ? 1 : 0,
      item.itemID
    );

    // Remove existing variants first
    db.prepare(`DELETE FROM item_variants WHERE itemID = ?`).run(item.itemID);

    if (item.hasVariants) {
      const stmt = db.prepare(`
        INSERT INTO item_variants (itemID, size, price)
        VALUES (?, ?, ?)
      `);
      for (const v of item.variants) {
        stmt.run(item.itemID, v.size, v.price);
      }
    }
  });

  ipcMain.handle("db:updateItem", (e, item) => {
    try {
      const exists = db
        .prepare("SELECT 1 FROM items WHERE itemID = ?")
        .get(item.itemID);

      if (!exists) {
        return { success: false, error: "ITEM_NOT_FOUND" };
      }

      updateItemTx(item);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ---------- DELETE ----------
  ipcMain.handle("db:deleteItem", (e, itemID) => {
    try {
      db.prepare("DELETE FROM items WHERE itemID = ?").run(itemID);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

module.exports = { registerItemHandlers };
