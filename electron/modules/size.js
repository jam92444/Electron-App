const { ipcMain } = require("electron");

function registerSizeHandlers(db) {
  /* -------------------------------------
        INSERT OR ADD NEW SIZE
    ----------------------------------------*/
  ipcMain.handle("db:insertSize", (_, sizeValue) => {
    // Ensure size is a number
    const size = Number(sizeValue);
    if (isNaN(size)) {
      return {
        success: false,
        error: "INVALID_SIZE",
        message: "Size must be a number",
      };
    }

    // Check if the size already exists
    const exist = db.prepare(`SELECT 1 FROM sizes WHERE size = ?`).get(size);

    if (exist) {
      return {
        success: false,
        error: "SIZE_ALREADY_EXIST",
        message: "Size already exists",
      };
    }

    // Insert the new size
    db.prepare(`INSERT INTO sizes (size) VALUES (?)`).run(size);

    return { success: true };
  });

  /* -----------------------------
     GET ALL SIZES
  ----------------------------- */
  ipcMain.handle("db:getSizes", () => {
    try {
      const sizes = db.prepare(`SELECT * FROM sizes`).all();
      return { success: true, sizes };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  /* -----------------------------
     UPDATE SIZE
  ----------------------------- */
  ipcMain.handle("db:updateSize", (_, { id, newSize }) => {
    try {
      // Check if size with same value already exists
      const exists = db
        .prepare(`SELECT 1 FROM sizes WHERE size = ? AND id != ?`)
        .get(newSize, id);
      if (exists) {
        return {
          success: false,
          error: "SIZE_ALREADY_EXIST",
          message: "This size already exists.",
        };
      }

      const result = db
        .prepare(`UPDATE sizes SET size = ? WHERE id = ?`)
        .run(newSize, id);
      if (result.changes === 0) {
        return {
          success: false,
          error: "NOT_FOUND",
          message: "Size not found.",
        };
      }

      return { success: true, message: "Size updated successfully." };
    } catch (err) {
      return { success: false, error: err.message };
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
      return { success: false, error: err.message };
    }
  });
}

module.exports = { registerSizeHandlers };
