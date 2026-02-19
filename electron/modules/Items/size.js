const { ipcMain } = require("electron");

function registerSizeHandlers(db) {
  /* -------------------------------------
        INSERT OR ADD NEW SIZE
  ----------------------------------------*/
  ipcMain.handle("db:insertSize", (_, sizeValue) => {
    const size = sizeValue?.toString().trim();
    if (!size) {
      return {
        success: false,
        error: "INVALID_SIZE",
        message: "Size must be provided.",
      };
    }

    // Check if size already exists
    const exist = db.prepare(`SELECT 1 FROM sizes WHERE size = ?`).get(size);
    if (exist) {
      return {
        success: false,
        error: "SIZE_ALREADY_EXIST",
        message: "Size already exists.",
      };
    }

    // Insert the new size
    db.prepare(`INSERT INTO sizes (size) VALUES (?)`).run(size);

    return { success: true, message: "Size added successfully." };
  });

  /* -----------------------------
     GET ALL SIZES
  ----------------------------- */
  ipcMain.handle("db:getSizes", () => {
    try {
      const sizes = db
        .prepare(`SELECT s.* FROM sizes s ORDER BY s.id DESC`)
        .all();
      return { success: true, sizes };
    } catch (err) {
      return { success: false, error: "DB_ERROR", message: err.message };
    }
  });

  /* -----------------------------
     UPDATE SIZE
  ----------------------------- */
  ipcMain.handle("db:updateSize", (_, { id, newSize }) => {
    try {
      const size = newSize?.toString().trim();
      if (!size) {
        return {
          success: false,
          error: "INVALID_SIZE",
          message: "New size must be provided.",
        };
      }

      // Check if same size already exists
      const exists = db
        .prepare(`SELECT 1 FROM sizes WHERE size = ? AND id != ?`)
        .get(size, id);
      if (exists) {
        return {
          success: false,
          error: "SIZE_ALREADY_EXIST",
          message: "This size already exists.",
        };
      }

      const result = db
        .prepare(`UPDATE sizes SET size = ? WHERE id = ?`)
        .run(size, id);

      if (result.changes === 0) {
        return {
          success: false,
          error: "NOT_FOUND",
          message: "Size not found.",
        };
      }

      return { success: true, message: "Size updated successfully." };
    } catch (err) {
      return { success: false, error: "DB_ERROR", message: err.message };
    }
  });

  /* -----------------------------
     DELETE SIZE
  ----------------------------- */
  ipcMain.handle("db:deleteSize", (_, id) => {
    try {
      const result = db.prepare(`DELETE FROM sizes WHERE id = ?`).run(id);
      if (result.changes === 0) {
        return {
          success: false,
          error: "NOT_FOUND",
          message: "Size not found.",
        };
      }
      return { success: true, message: "Size deleted successfully." };
    } catch (err) {
      return { success: false, error: "DB_ERROR", message: err.message };
    }
  });

  /* -----------------------------
     FILTER SIZES
  ----------------------------- */
  ipcMain.handle("db:filterSizes", (_, filters) => {
    try {
      let query = "SELECT * FROM sizes WHERE 1=1";
      const params = [];

      if (filters.size) {
        query += " AND size LIKE ?";
        params.push(`%${filters.size.trim()}%`);
      }

      const sizes = db.prepare(query).all(...params);
      return { success: true, sizes };
    } catch (err) {
      return { success: false, error: "DB_ERROR", message: err.message };
    }
  });
}

module.exports = { registerSizeHandlers };
