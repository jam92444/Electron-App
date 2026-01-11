const { ipcMain } = require("electron");

function registerDiscountHandlers(db) {

  /* =========================
     CREATE DISCOUNT
  ========================= */
  const insertDiscountTx = db.transaction((discount) => {
    if (!discount.name) {
      throw new Error("DISCOUNT_NAME_REQUIRED");
    }

    const result = db.prepare(`
      INSERT INTO discounts (name, percentage, valid_days, is_active)
      VALUES (?, ?, ?, ?)
    `).run(
      discount.name,
      discount.percentage,
      discount.valid_days,
      discount.is_active ?? 1
    );

    return result.lastInsertRowid;
  });

  ipcMain.handle("db:createDiscount", (e, discount) => {
    try {
      const discountId = insertDiscountTx(discount);
      return { success: true, discountId, message: "Discount created successfully." };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* =========================
     UPDATE DISCOUNT
  ========================= */
  const updateDiscountTx = db.transaction((discountId, discount) => {
    if (!discount.name) {
      throw new Error("DISCOUNT_NAME_REQUIRED");
    }

    db.prepare(`
      UPDATE discounts
      SET name = ?,
          percentage = ?,
          valid_days = ?,
          is_active = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      discount.name,
      discount.percentage,
      discount.valid_days,
      discount.is_active ?? 1,
      discountId
    );
  });

  ipcMain.handle("db:updateDiscount", (e, discountId, discount) => {
    try {
      const exists = db.prepare(
        `SELECT 1 FROM discounts WHERE id = ?`
      ).get(discountId);

      if (!exists) {
        return { success: false, error: "DISCOUNT_NOT_FOUND" };
      }

      updateDiscountTx(discountId, discount);
      return { success: true, message: "Discount updated successfully." };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* =========================
     DELETE DISCOUNT
  ========================= */
  ipcMain.handle("db:deleteDiscount", (e, discountId) => {
    try {
      const result = db.prepare(`
        DELETE FROM discounts WHERE id = ?
      `).run(discountId);

      if (result.changes === 0) {
        return { success: false, error: "DISCOUNT_NOT_FOUND" };
      }

      return { success: true, message: "Discount deleted successfully." };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* =========================
     GET ALL DISCOUNTS
  ========================= */
  ipcMain.handle("db:getDiscounts", () => {
    try {
      const discounts = db.prepare(`
        SELECT *
        FROM discounts
        ORDER BY created_at DESC
      `).all();

      return { success: true, discounts };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* =========================
     GET DISCOUNT BY ID
  ========================= */
  ipcMain.handle("db:getDiscountById", (e, discountId) => {
    try {
      const discount = db.prepare(`
        SELECT *
        FROM discounts
        WHERE id = ?
      `).get(discountId);

      if (!discount) {
        return { success: false, error: "DISCOUNT_NOT_FOUND" };
      }

      return { success: true, discount };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

module.exports = { registerDiscountHandlers };
