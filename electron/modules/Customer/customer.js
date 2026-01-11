const { ipcMain } = require("electron");

function registerCustomerHandlers(db) {
  /* ---------------- CREATE CUSTOMER ---------------- */
  ipcMain.handle("db:createCustomer", (e, customer) => {
    try {
      const result = db.prepare(`
        INSERT INTO customers 
        (name, phone, discountId, discountPercentage, discountStartDate, discountEndDate)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        customer.name,
        customer.phone,
        customer.discountId || null,
        customer.discountPercentage || 0,
        customer.discountStartDate || null,
        customer.discountEndDate || null
      );

      return { success: true, customerId: result.lastInsertRowid };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* ---------------- GET ALL CUSTOMERS ---------------- */
  ipcMain.handle("db:getCustomers", () => {
    try {
      const customers = db.prepare(`
        SELECT c.*, d.name as discountName
        FROM customers c
        LEFT JOIN discounts d ON c.discountId = d.id
        ORDER BY c.created_at DESC
      `).all();
      return { success: true, data:customers };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* ---------------- UPDATE CUSTOMER ---------------- */
  ipcMain.handle("db:updateCustomer", (e, customer) => {
    try {
      const result = db.prepare(`
        UPDATE customers
        SET name = ?,
            phone = ?,
            discountId = ?,
            discountPercentage = ?,
            discountStartDate = ?,
            discountEndDate = ?
        WHERE id = ?
      `).run(
        customer.name,
        customer.phone,
        customer.discountId || null,
        customer.discountPercentage || 0,
        customer.discountStartDate || null,
        customer.discountEndDate || null,
        customer.id
      );

      if (result.changes === 0) {
        return { success: false, error: "Customer not found" };
      }

      return { success: true, message: "Customer updated successfully" };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* ---------------- DELETE CUSTOMER ---------------- */
  ipcMain.handle("db:deleteCustomer", (e, id) => {
    try {
      const result = db.prepare(`DELETE FROM customers WHERE id = ?`).run(id);

      if (result.changes === 0) {
        return { success: false, error: "Customer not found" };
      }

      return { success: true, message: "Customer deleted successfully" };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

module.exports = { registerCustomerHandlers };
