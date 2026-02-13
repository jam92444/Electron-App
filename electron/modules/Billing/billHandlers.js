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

  /* ----------------- GET BILL BY ID ----------------- */
  ipcMain.handle("db:getBillById", (e, billId) => {
    try {
      const bill = db
        .prepare(
          `
        SELECT 
          b.*,
          c.name AS customer_name,
          c.phone AS customer_phone
        FROM bills b
        LEFT JOIN customers c ON c.id = b.customer_id
        WHERE b.id = ?
      `,
        )
        .get(billId);

      if (!bill) {
        return { success: false };
      }

      const items = db
        .prepare(
          `
        SELECT 
          item_code,
          item_name,
          price,
          size,
          quantity,
          total_amount
        FROM bill_items
        WHERE bill_id = ?
      `,
        )
        .all(billId);

      return {
        success: true,
        bill,
        items,
      };
    } catch (err) {
      console.error("❌ db:getBillById", err);
      return { success: false };
    }
  });

  /* ----------------- GET ALL BILLS (PAGINATED) ----------------- */
  ipcMain.handle("db:getBills", (e, params = {}) => {
    try {
      const page = Number(params.page || 1);
      const pageSize = Number(params.pageSize || 10);
      const offset = (page - 1) * pageSize;

      // Total count
      const total = db
        .prepare(`SELECT COUNT(*) AS count FROM bills`)
        .get().count;

      // Paged data
      const rows = db
        .prepare(
          `
             SELECT 
               b.id,
               b.invoice_number,
               b.total_pieces,
               b.total_after_discount,
               b.discount,
               b.payment_mode,
               b.created_at,
               c.name AS customer_name,
               c.phone AS customer_phone
             FROM bills b
             LEFT JOIN customers c ON c.id = b.customer_id
             ORDER BY b.id DESC
             LIMIT ? OFFSET ?
           `,
        )
        .all(pageSize, offset);

      return {
        success: true,
        data: rows,
        pagination: {
          page,
          pageSize,
          total,
        },
      };
    } catch (err) {
      console.error("❌ db:getBills", err);
      return { success: false };
    }
  });

  /* ----------------- DASHBOARD DATA ----------------- */
  ipcMain.handle("db:getSalesDashboard", (e, { fromDate, toDate } = {}) => {
    try {
      let queryFilter = "";
      const params = [];

      if (fromDate && toDate) {
        queryFilter = "WHERE date(b.created_at) BETWEEN ? AND ?";
        params.push(fromDate, toDate);
      }

      // Total sales, total bills, total discount, total pieces
      const totals = db
        .prepare(
          `
        SELECT 
          COUNT(*) AS totalBills,
          SUM(total_after_discount) AS totalSales,
          SUM(discount_amount) AS totalDiscount,
          SUM(total_pieces) AS totalPieces
        FROM bills b
        ${queryFilter}
      `,
        )
        .get(...params);

      // Payment mode distribution
      const paymentModes = db
        .prepare(
          `
        SELECT payment_mode, COUNT(*) AS count
        FROM bills
        ${queryFilter}
        GROUP BY payment_mode
      `,
        )
        .all(...params);

      // Top selling items
      const topItems = db
        .prepare(
          `
        SELECT bi.item_code, bi.item_name, SUM(bi.quantity) AS totalSold
        FROM bill_items bi
        JOIN bills b ON b.id = bi.bill_id
        ${queryFilter ? queryFilter.replace("b.", "b.") : ""}
        GROUP BY bi.item_code, bi.item_name
        ORDER BY totalSold DESC
        LIMIT 5
      `,
        )
        .all(...params);

      return {
        success: true,
        totals,
        paymentModes,
        topItems,
      };
    } catch (err) {
      console.error("❌ db:getSalesDashboard", err);
      return { success: false, error: err.message };
    }
  });
}

module.exports = { registerBillHandlers };
