const { ipcMain } = require("electron");

function registerBillHandlers(db) {
  /* ======================================================
     SAVE BILL
  ====================================================== */
  const insertBillTx = db.transaction((bill, items) => {
    // 1️⃣ Get invoice settings
    const settings = db.prepare(`
      SELECT invoicePrefix, enableInvoicePrefix, lastInvoiceNumber
      FROM settings WHERE id = 1
    `).get();

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
      bill.payment_mode || ""
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
        item.totalAmount
      );
    }

    // 4️⃣ Update invoice counter
    db.prepare(`
      UPDATE settings
      SET lastInvoiceNumber = ?
      WHERE id = 1
    `).run(nextNumber);

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

  /* ======================================================
     UPDATE BILL
  ====================================================== */
  const updateBillTx = db.transaction((billId, bill, items) => {
    db.prepare(`
      UPDATE bills SET
        customer_id = ?,
        total_pieces = ?,
        total_before_discount = ?,
        discount = ?,
        discount_amount = ?,
        total_after_discount = ?,
        payment_mode = ?
      WHERE id = ?
    `).run(
      bill.customerId || null,
      bill.totalPieces,
      bill.totalBeforeDiscount,
      bill.discount,
      bill.discountAmount,
      bill.totalAfterDiscount,
      bill.payment_mode || "",
      billId
    );

    // Replace bill items
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
      updateBillTx(billId, bill, items);
      return { success: true };
    } catch (err) {
      console.error("❌ db:updateBill", err);
      return { success: false };
    }
  });

  /* ======================================================
     GET ALL BILLS (WITH CUSTOMER)
  ====================================================== */
  ipcMain.handle("db:getBills", () => {
    try {
      const bills = db.prepare(`
        SELECT 
          b.*,
          c.name AS customer_name,
          c.phone AS customer_phone
        FROM bills b
        LEFT JOIN customers c ON c.id = b.customer_id
        ORDER BY b.created_at DESC
      `).all();

      return { success: true, data: bills };
    } catch (err) {
      console.error("❌ db:getBills", err);
      return { success: false, data: [] };
    }
  });

  /* ======================================================
     GET SINGLE BILL
  ====================================================== */
  ipcMain.handle("db:getBillById", (e, billId) => {
    try {
      const bill = db.prepare(`
        SELECT 
          b.*,
          c.name AS customer_name,
          c.phone AS customer_phone
        FROM bills b
        LEFT JOIN customers c ON c.id = b.customer_id
        WHERE b.id = ?
      `).get(billId);

      if (!bill) {
        return { success: true, bill: null, items: [] };
      }

      const items = db
        .prepare(`SELECT * FROM bill_items WHERE bill_id = ?`)
        .all(billId);

      return { success: true, bill, items };
    } catch (err) {
      console.error("❌ db:getBillById", err);
      return { success: false, bill: null, items: [] };
    }
  });

  /* ======================================================
     DELETE BILL
  ====================================================== */
  ipcMain.handle("db:deleteBill", (e, billId) => {
    try {
      db.prepare(`DELETE FROM bills WHERE id = ?`).run(billId);
      return { success: true };
    } catch (err) {
      console.error("❌ db:deleteBill", err);
      return { success: false };
    }
  });

  console.log("✅ Bill IPC handlers updated for new bills schema");
}

module.exports = { registerBillHandlers };
