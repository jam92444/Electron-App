const { ipcMain } = require("electron");

function registerBillHandlers(db) {
  // ---------- SAVE BILL ----------
  const insertBillTx = db.transaction((bill, items) => {
    const billStmt = db.prepare(`
      INSERT INTO bills (
        total_pieces,
        total_before_discount,
        discount,
        discount_amount,
        total_after_discount,
        payment_mode,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    const result = billStmt.run(
      bill.totalPieces,
      bill.totalBeforeDiscount,
      bill.discount,
      bill.discountAmount,
      bill.totalAfterDiscount,
      bill.payment_mode || ""
    );

    const billId = result.lastInsertRowid;

    const itemStmt = db.prepare(`
      INSERT INTO bill_items (
        bill_id,
        item_code,
        item_name,
        price,
        size,
        quantity,
        total_amount
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      itemStmt.run(
        billId,
        item.itemCode,
        item.itemName,
        item.price,
        item.size || "",
        item.quantity,
        item.totalAmount
      );
    }

    return billId;
  });

  ipcMain.handle("db:saveBill", (e, bill, items) => {
    try {
      const billId = insertBillTx(bill, items);
      return { success: true, billId };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ---------- UPDATE BILL ----------
  const updateBillTx = db.transaction((billId, bill, items) => {
    db.prepare(`
      UPDATE bills SET
        total_pieces = ?,
        total_before_discount = ?,
        discount = ?,
        discount_amount = ?,
        total_after_discount = ?,
        payment_mode = ?
      WHERE id = ?
    `).run(
      bill.totalPieces,
      bill.totalBeforeDiscount,
      bill.discount,
      bill.discountAmount,
      bill.totalAfterDiscount,
      bill.payment_mode || "",
      billId
    );

    // Sync items: delete old and insert new
    db.prepare(`DELETE FROM bill_items WHERE bill_id = ?`).run(billId);

    const itemStmt = db.prepare(`
      INSERT INTO bill_items (
        bill_id,
        item_code,
        item_name,
        price,
        size,
        quantity,
        total_amount
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      itemStmt.run(
        billId,
        item.itemCode,
        item.itemName,
        item.price,
        item.size || "",
        item.quantity,
        item.totalAmount
      );
    }
  });

  ipcMain.handle("db:updateBill", (e, billId, bill, items) => {
    try {
      const exists = db.prepare("SELECT 1 FROM bills WHERE id = ?").get(billId);
      if (!exists) return { success: false, error: "BILL_NOT_FOUND" };

      updateBillTx(billId, bill, items);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ---------- GET ALL BILLS ----------
  ipcMain.handle("db:getBills", () => {
    try {
      const bills = db.prepare(`SELECT * FROM bills ORDER BY created_at DESC`).all();
      return { success: true, data:bills };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ---------- GET SINGLE BILL ----------
  ipcMain.handle("db:getBillById", (e, billId) => {
    try {
      const bill = db.prepare(`SELECT * FROM bills WHERE id = ?`).get(billId);
      if (!bill) return { success: false, error: "BILL_NOT_FOUND" };

      const items = db.prepare(`SELECT * FROM bill_items WHERE bill_id = ?`).all(billId);
      return { success: true, bill, items };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ---------- DELETE BILL ----------
  ipcMain.handle("db:deleteBill", (e, billId) => {
    try {
      db.prepare(`DELETE FROM bills WHERE id = ?`).run(billId); // cascades to bill_items
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ---------- FILTER BILLS ----------
  ipcMain.handle("db:filterBills", (e, filters) => {
    try {
      let query = "SELECT * FROM bills WHERE 1=1";
      const params = [];

      // Only filter by columns that exist
      if (filters.fromDate) {
        query += " AND created_at >= ?";
        params.push(filters.fromDate);
      }
      if (filters.toDate) {
        query += " AND created_at <= ?";
        params.push(filters.toDate);
      }

      const bills = db.prepare(query).all(...params);
      return { success: true, bills };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

module.exports = { registerBillHandlers };
