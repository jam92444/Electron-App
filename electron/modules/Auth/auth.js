// modules/Auth/auth.js
const { ipcMain } = require("electron");
const bcrypt = require("bcrypt");
const Store = require("electron-store").default;

const store = new Store();

let currentUser = null;

function registerAuthHandler(db) {
  /* =====================================================
     LOGIN
  ===================================================== */
  ipcMain.handle("db:loginUser", async (event, { username, password }) => {
    try {
      const user = db
        .prepare(
          `
        SELECT id, username, full_name, password_hash, status
        FROM users
        WHERE username = ?
      `,
        )
        .get(username);

      if (!user || user.status !== "Active") {
        return { success: false, message: "Invalid username or password" };
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return { success: false, message: "Invalid username or password" };
      }

      // ✅ Fetch roles
      const role = db
        .prepare(
          `
          SELECT r.id, r.name
          FROM roles r
          JOIN user_roles ur ON ur.role_id = r.id
          WHERE ur.user_id = ?
          LIMIT 1
        `,
        )
        .get(user.id);

      // ✅ Fetch permissions for these roles
      let permissions = [];

      if (role) {
        permissions = db
          .prepare(
            `
            SELECT p.permission_key
            FROM permissions p
            JOIN role_permissions rp ON rp.permission_id = p.id
            WHERE rp.role_id = ?
          `,
          )
          .all(role.id)
          .map((p) => p.permission_key);
      }
      currentUser = {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        roles: role,
        permissions,
      };

      store.set("sessionUserId", user.id);

      return { success: true, user: currentUser };
    } catch (error) {
      console.error("Login Error:", error);
      return { success: false, message: "Login failed" };
    }
  });

  /* =====================================================
     RESTORE SESSION (Auto Login)
  ===================================================== */
  ipcMain.handle("db:restoreSession", async () => {
    try {
      const userId = store.get("sessionUserId");
      if (!userId) return { success: false };

      const user = db
        .prepare(
          `
        SELECT id, username, full_name, status
        FROM users
        WHERE id = ?
      `,
        )
        .get(userId);

      if (!user || user.status !== "Active") {
        store.delete("sessionUserId");
        currentUser = null;
        return { success: false };
      }

      // Fetch roles
      const roles = db
        .prepare(
          `
        SELECT r.id, r.name
        FROM roles r
        JOIN user_roles ur ON ur.role_id = r.id
        WHERE ur.user_id = ?
      `,
        )
        .all(user.id);

      // Fetch permissions
      let permissions = [];
      if (roles.length > 0) {
        const roleIds = roles.map((r) => r.id);
        const placeholders = roleIds.map(() => "?").join(", ");
        permissions = db
          .prepare(
            `
          SELECT DISTINCT p.permission_key
          FROM permissions p
          JOIN role_permissions rp ON rp.permission_id = p.id
          WHERE rp.role_id IN (${placeholders})
        `,
          )
          .all(...roleIds)
          .map((p) => p.permission_key);
      }

      currentUser = {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        roles: roles.map((r) => r.name),
        permissions,
      };

      return { success: true, user: currentUser };
    } catch (error) {
      console.error("Restore Session Error:", error);
      return { success: false };
    }
  });
  /* =====================================================
     LOGOUT
  ===================================================== */
  ipcMain.handle("db:logout", async () => {
    currentUser = null;
    store.delete("sessionUserId");
    return { success: true };
  });

  /* =====================================================
     GET CURRENT USER
  ===================================================== */
  ipcMain.handle("db:getCurrentUser", async () => {
    return currentUser;
  });
}

module.exports = registerAuthHandler;
