const { ipcMain } = require("electron");

function registerExpenseHandlers(db) {
  /** -----------------------
   * GET ALL CATEGORIES
   * ----------------------- */
  ipcMain.handle("db:getExpenseCategories", () => {
    try {
      const rows = db
        .prepare(`SELECT * FROM expense_categories ORDER BY is_default DESC, name ASC`)
        .all();
      return { success: true, categories: rows };
    } catch (err) {
      return { success: false, code: "DB_ERROR", error: err.message };
    }
  });

  /** -----------------------
   * CREATE CATEGORY
   * ----------------------- */
  ipcMain.handle("db:insertExpenseCategory", (e, name) => {
    try {
      const exists = db
        .prepare("SELECT 1 FROM expense_categories WHERE name = ?")
        .get(name);
      if (exists) return { success: false, error: "CATEGORY_EXISTS" };

      db.prepare(
        `INSERT INTO expense_categories (name, is_default) VALUES (?, 0)`
      ).run(name);

      return { success: true, message: "Category added successfully" };
    } catch (err) {
      return { success: false, code: "DB_ERROR", error: err.message };
    }
  });

  /** -----------------------
   * DELETE CATEGORY (non-default only)
   * ----------------------- */
  ipcMain.handle("db:deleteExpenseCategory", (e, id) => {
    try {
      const category = db
        .prepare("SELECT * FROM expense_categories WHERE id = ?")
        .get(id);
      if (!category) return { success: false, error: "CATEGORY_NOT_FOUND" };
      if (category.is_default)
        return { success: false, error: "CANNOT_DELETE_DEFAULT_CATEGORY" };

      const inUse = db
        .prepare("SELECT 1 FROM expenses WHERE category_id = ?")
        .get(id);
      if (inUse)
        return { success: false, error: "CATEGORY_IN_USE" };

      db.prepare("DELETE FROM expense_categories WHERE id = ?").run(id);
      return { success: true, message: "Category deleted successfully" };
    } catch (err) {
      return { success: false, code: "DB_ERROR", error: err.message };
    }
  });

  /** -----------------------
   * GET ALL EXPENSES
   * ----------------------- */
  ipcMain.handle("db:getExpenses", () => {
    try {
      const rows = db
        .prepare(
          `
          SELECT
            e.id,
            e.amount,
            e.description,
            e.expense_date,
            e.created_at,
            e.updated_at,
            ec.id   AS category_id,
            ec.name AS category_name,
            ec.is_default
          FROM expenses e
          JOIN expense_categories ec ON e.category_id = ec.id
          ORDER BY e.expense_date DESC, e.created_at DESC
          `
        )
        .all();

      return { success: true, expenses: rows };
    } catch (err) {
      return { success: false, code: "DB_ERROR", error: err.message };
    }
  });

  /** -----------------------
   * GET EXPENSES BY DATE RANGE
   * ----------------------- */
  ipcMain.handle("db:getExpensesByDateRange", (e, { startDate, endDate }) => {
    try {
      const rows = db
        .prepare(
          `
          SELECT
            e.id,
            e.amount,
            e.description,
            e.expense_date,
            e.created_at,
            e.updated_at,
            ec.id   AS category_id,
            ec.name AS category_name,
            ec.is_default
          FROM expenses e
          JOIN expense_categories ec ON e.category_id = ec.id
          WHERE e.expense_date BETWEEN ? AND ?
          ORDER BY e.expense_date DESC, e.created_at DESC
          `
        )
        .all(startDate, endDate);

      return { success: true, expenses: rows };
    } catch (err) {
      return { success: false, code: "DB_ERROR", error: err.message };
    }
  });

  /** -----------------------
   * GET EXPENSE SUMMARY (total per category)
   * ----------------------- */
  ipcMain.handle("db:getExpenseSummary", (e, { startDate, endDate } = {}) => {
    try {
      const query = startDate && endDate
        ? `
          SELECT
            ec.name AS category_name,
            COUNT(e.id) AS total_entries,
            SUM(e.amount) AS total_amount
          FROM expenses e
          JOIN expense_categories ec ON e.category_id = ec.id
          WHERE e.expense_date BETWEEN ? AND ?
          GROUP BY ec.id
          ORDER BY total_amount DESC
          `
        : `
          SELECT
            ec.name AS category_name,
            COUNT(e.id) AS total_entries,
            SUM(e.amount) AS total_amount
          FROM expenses e
          JOIN expense_categories ec ON e.category_id = ec.id
          GROUP BY ec.id
          ORDER BY total_amount DESC
          `;

      const rows = startDate && endDate
        ? db.prepare(query).all(startDate, endDate)
        : db.prepare(query).all();

      const grandTotal = rows.reduce((sum, r) => sum + (r.total_amount || 0), 0);
      return { success: true, summary: rows, grandTotal };
    } catch (err) {
      return { success: false, code: "DB_ERROR", error: err.message };
    }
  });

  /** -----------------------
   * INSERT EXPENSE
   * ----------------------- */
  ipcMain.handle("db:insertExpense", (e, expense) => {
    try {
      const category = db
        .prepare("SELECT 1 FROM expense_categories WHERE id = ?")
        .get(expense.category_id);
      if (!category) return { success: false, error: "CATEGORY_NOT_FOUND" };

      if (!expense.amount || expense.amount <= 0)
        return { success: false, error: "INVALID_AMOUNT" };

      db.prepare(
        `
        INSERT INTO expenses (category_id, amount, description, expense_date)
        VALUES (?, ?, ?, ?)
        `
      ).run(
        expense.category_id,
        expense.amount,
        expense.description || null,
        expense.expense_date || new Date().toISOString().split("T")[0]
      );

      return { success: true, message: "Expense added successfully" };
    } catch (err) {
      return { success: false, code: "DB_ERROR", error: err.message };
    }
  });

  /** -----------------------
   * UPDATE EXPENSE
   * ----------------------- */
  ipcMain.handle("db:updateExpense", (e, expense) => {
    try {
      const exists = db
        .prepare("SELECT 1 FROM expenses WHERE id = ?")
        .get(expense.id);
      if (!exists) return { success: false, error: "EXPENSE_NOT_FOUND" };

      const category = db
        .prepare("SELECT 1 FROM expense_categories WHERE id = ?")
        .get(expense.category_id);
      if (!category) return { success: false, error: "CATEGORY_NOT_FOUND" };

      if (!expense.amount || expense.amount <= 0)
        return { success: false, error: "INVALID_AMOUNT" };

      db.prepare(
        `
        UPDATE expenses
        SET category_id = ?, amount = ?, description = ?, expense_date = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `
      ).run(
        expense.category_id,
        expense.amount,
        expense.description || null,
        expense.expense_date,
        expense.id
      );

      return { success: true, message: "Expense updated successfully" };
    } catch (err) {
      return { success: false, code: "DB_ERROR", error: err.message };
    }
  });

  /** -----------------------
   * DELETE EXPENSE
   * ----------------------- */
  ipcMain.handle("db:deleteExpense", (e, id) => {
    try {
      const exists = db
        .prepare("SELECT 1 FROM expenses WHERE id = ?")
        .get(id);
      if (!exists) return { success: false, error: "EXPENSE_NOT_FOUND" };

      db.prepare("DELETE FROM expenses WHERE id = ?").run(id);
      return { success: true, message: "Expense deleted successfully" };
    } catch (err) {
      return { success: false, code: "DB_ERROR", error: err.message };
    }
  });
}

module.exports = { registerExpenseHandlers };