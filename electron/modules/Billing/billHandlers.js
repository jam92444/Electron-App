const { ipcMain } = require("electron");

/** ---------------- Helper: Reduce/Restore Stock ---------------- */
function adjustStock(db, items, type = "reduce") {
  const multiplier = type === "reduce" ? -1 : 1;

  for (const item of items) {
    if (item.size) {
      // Variant exists
      const variant = db
        .prepare("SELECT * FROM item_variants WHERE itemID = ? AND size = ?")
        .get(item.itemCode, item.size);

      if (variant) {
        db.prepare(
          `
          UPDATE item_variants
          SET quantity = quantity + ?
          WHERE id = ?
        `,
        ).run(item.quantity * multiplier, variant.id);
      }
    } else {
      // Normal item
      const mainItem = db
        .prepare("SELECT * FROM items WHERE itemID = ?")
        .get(item.itemCode);

      if (mainItem) {
        db.prepare(
          `
          UPDATE items
          SET quantity = quantity + ?
          WHERE itemID = ?
        `,
        ).run(item.quantity * multiplier, mainItem.itemID);
      }
    }
  }
}

/* --------------------- BILL HANDLERS --------------------- */
function registerBillHandlers(db) {
  /* ----------------- SAVE BILL ----------------- */
  const insertBillTx = db.transaction((bill, items) => {
    // 1️⃣ Invoice number logic
    const settings = db
      .prepare(
        `
      SELECT invoicePrefix, enableInvoicePrefix, lastInvoiceNumber
      FROM settings WHERE id = 1
    `,
      )
      .get();

    const nextNumber = (settings.lastInvoiceNumber || 0) + 1;
    const paddedNumber = String(nextNumber).padStart(4, "0");

    const invoiceNumber = settings.enableInvoicePrefix
      ? `${settings.invoicePrefix || ""}${paddedNumber}`
      : paddedNumber;

    // 2️⃣ Insert bill
    const billStmt = db.prepare(`
      INSERT INTO bills (
        invoice_number,
        customer_id,
        total_pieces,
        total_before_discount,
        discount,
        discount_amount,
        total_after_discount,
        payment_mode
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = billStmt.run(
      invoiceNumber,
      bill.customerId || null,
      bill.totalPieces,
      bill.totalBeforeDiscount,
      bill.discount,
      bill.discountAmount,
      bill.totalAfterDiscount,
      bill.payment_mode || "",
    );

    const billId = result.lastInsertRowid;

    // 3️⃣ Insert bill items
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
        item.totalAmount,
      );
    }

    // 4️⃣ Reduce stock
    adjustStock(db, items, "reduce");

    // 5️⃣ Update invoice counter
    db.prepare(
      `
      UPDATE settings
      SET lastInvoiceNumber = ?
      WHERE id = 1
    `,
    ).run(nextNumber);

    return { billId, invoiceNumber };
  });

  ipcMain.handle("db:saveBill", (e, bill, items) => {
    try {
      const result = insertBillTx(bill, items);
      return { success: true, ...result };
    } catch (err) {
      console.error("❌ db:saveBill", err);
      return { success: false };
    }
  });

  /* ----------------- UPDATE BILL ----------------- */
  const updateBillTx = db.transaction((billId, bill, items) => {
    // 1️⃣ Restore previous stock
    const previousItems = db
      .prepare(`SELECT * FROM bill_items WHERE bill_id = ?`)
      .all(billId);
    adjustStock(db, previousItems, "restore");

    // 2️⃣ Update bill info
    db.prepare(
      `
      UPDATE bills SET
        customer_id = ?,
        total_pieces = ?,
        total_before_discount = ?,
        discount = ?,
        discount_amount = ?,
        total_after_discount = ?,
        payment_mode = ?
      WHERE id = ?
    `,
    ).run(
      bill.customerId || null,
      bill.totalPieces,
      bill.totalBeforeDiscount,
      bill.discount,
      bill.discountAmount,
      bill.totalAfterDiscount,
      bill.payment_mode || "",
      billId,
    );

    // 3️⃣ Replace bill items
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
        item.totalAmount,
      );
    }

    // 4️⃣ Reduce stock for new items
    adjustStock(db, items, "reduce");
  });

  ipcMain.handle("db:updateBill", (e, billId, bill, items) => {
    try {
      updateBillTx(billId, bill, items);
      return { success: true };
    } catch (err) {
      console.error("❌ db:updateBill", err);
      return { success: false };
    }
  });

  /* ----------------- DELETE BILL ----------------- */
  ipcMain.handle("db:deleteBill", (e, billId) => {
    try {
      // Restore stock before deleting
      const previousItems = db
        .prepare(`SELECT * FROM bill_items WHERE bill_id = ?`)
        .all(billId);
      adjustStock(db, previousItems, "restore");

      db.prepare(`DELETE FROM bills WHERE id = ?`).run(billId);
      return { success: true };
    } catch (err) {
      console.error("❌ db:deleteBill", err);
      return { success: false };
    }
  });

  console.log("✅ Bill IPC handlers updated with stock adjustment");
}

module.exports = { registerBillHandlers };
