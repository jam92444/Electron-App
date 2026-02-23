const { ipcMain } = require("electron");
const bcrypt = require("bcrypt");

function registerUserHandlers(db) {

  /* =====================================================
     GET USERS
  ===================================================== */
  ipcMain.handle("db:getUsers", async () => {
    try {
      const users = db.prepare(`
        SELECT id, username, full_name, email, status, created_at
        FROM users
        ORDER BY created_at DESC
      `).all();

      return { success: true, users };
    } catch (error) {
      console.error("GET USERS ERROR:", error);
      return { success: false, error: "Failed to fetch users" };
    }
  });


  /* =====================================================
     INSERT USER
  ===================================================== */
  ipcMain.handle("db:insertUser", async (event, user) => {
    try {
      // Check duplicate username
      const existing = db.prepare(`
        SELECT id FROM users WHERE username = ?
      `).get(user.username);

      if (existing) {
        return { success: false, error: "USERNAME_EXISTS" };
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);

      db.prepare(`
        INSERT INTO users
        (username, password_hash, full_name, email, status)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        user.username,
        hashedPassword,
        user.full_name || "",
        user.email || "",
        user.status || "Active"
      );

      return { success: true, message: "User created successfully" };

    } catch (error) {
      console.error("INSERT USER ERROR:", error);
      return { success: false, error: "Failed to create user" };
    }
  });


  /* =====================================================
     UPDATE USER
  ===================================================== */
  ipcMain.handle("db:updateUser", async (event, user) => {
    try {
      const existing = db.prepare(`
        SELECT id FROM users WHERE username = ? AND id != ?
      `).get(user.username, user.id);

      if (existing) {
        return { success: false, error: "USERNAME_EXISTS" };
      }

      let query = `
        UPDATE users
        SET username = ?,
            full_name = ?,
            email = ?,
            status = ?
      `;

      const params = [
        user.username,
        user.full_name || "",
        user.email || "",
        user.status || "Active"
      ];

      // If password provided → update
      if (user.password && user.password.trim() !== "") {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        query += `, password_hash = ?`;
        params.push(hashedPassword);
      }

      query += ` WHERE id = ?`;
      params.push(user.id);

      db.prepare(query).run(...params);

      return { success: true, message: "User updated successfully" };

    } catch (error) {
      console.error("UPDATE USER ERROR:", error);
      return { success: false, error: "Failed to update user" };
    }
  });


  /* =====================================================
     DELETE USER
  ===================================================== */
  ipcMain.handle("db:deleteUser", async (event, id) => {
    try {
      // Prevent deleting superadmin
      const user = db.prepare(`
        SELECT username FROM users WHERE id = ?
      `).get(id);

      if (user?.username === "superadmin") {
        return {
          success: false,
          error: "Cannot delete superadmin user"
        };
      }

      db.prepare(`DELETE FROM users WHERE id = ?`).run(id);

      return { success: true, message: "User deleted successfully" };

    } catch (error) {
      console.error("DELETE USER ERROR:", error);
      return { success: false, error: "Failed to delete user" };
    }
  });

}

module.exports = registerUserHandlers;