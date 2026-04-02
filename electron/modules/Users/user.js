const { ipcMain } = require("electron");
const bcrypt = require("bcryptjs");

function registerUserHandlers(db) {
  /* =====================================================
     GET USERS
  ===================================================== */
  /* =====================================================
   GET USERS (WITH ROLE)
===================================================== */
  ipcMain.handle("db:getUsers", async () => {
    try {
      const users = db
        .prepare(
          `
        SELECT 
          u.id,
          u.username,
          u.full_name,
          u.email,
          u.status,
          u.created_at,
          r.id AS role_id,
          r.name AS role_name
        FROM users u
        LEFT JOIN user_roles ur ON ur.user_id = u.id
        LEFT JOIN roles r ON r.id = ur.role_id
        ORDER BY u.created_at DESC
      `,
        )
        .all();

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
      const existing = db
        .prepare(`SELECT id FROM users WHERE username = ?`)
        .get(user.username);

      if (existing) {
        return { success: false, error: "USERNAME_EXISTS" };
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Transaction for user + role
      const trx = db.transaction(() => {
        const result = db
          .prepare(
            `
        INSERT INTO users
        (username, password_hash, full_name, email, status)
        VALUES (?, ?, ?, ?, ?)
      `,
          )
          .run(
            user.username,
            hashedPassword,
            user.full_name || "",
            user.email || "",
            user.status || "Active",
          );

        const userId = result.lastInsertRowid;

        // 🚫 Do NOT assign role to superadmin
        if (user.username !== "superadmin" && user.role_id) {
          db.prepare(
            `
          INSERT INTO user_roles (user_id, role_id)
          VALUES (?, ?)
        `,
          ).run(userId, user.role_id);
        }
      });

      trx();

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
      const existingUser = db
        .prepare(
          `
      SELECT username FROM users WHERE id = ?
    `,
        )
        .get(user.id);

      if (!existingUser) {
        return { success: false, error: "USER_NOT_FOUND" };
      }

      const isSuperAdmin = existingUser.username === "superadmin";

      // 🔒 Prevent renaming superadmin
      if (isSuperAdmin && user.username !== "superadmin") {
        return { success: false, error: "Cannot rename superadmin" };
      }

      // 🔒 Prevent deactivating superadmin
      if (isSuperAdmin && user.status !== "Active") {
        return { success: false, error: "Cannot deactivate superadmin" };
      }

      // Check duplicate username
      const duplicate = db
        .prepare(
          `
      SELECT id FROM users WHERE username = ? AND id != ?
    `,
        )
        .get(user.username, user.id);

      if (duplicate) {
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
        user.username.trim(),
        user.full_name || "",
        user.email || "",
        user.status || "Active",
      ];

      // ✅ Allow password change for everyone (including superadmin)
      if (user.password && user.password.trim() !== "") {
        const hashedPassword = await bcrypt.hash(user.password.trim(), 10);
        query += `, password_hash = ?`;
        params.push(hashedPassword);
      }

      query += ` WHERE id = ?`;
      params.push(user.id);

      db.prepare(query).run(...params);

      // 🔄 Update role if not superadmin
      if (user.username !== "superadmin" && user.role_id) {
        db.prepare(`DELETE FROM user_roles WHERE user_id = ?`).run(user.id);

        db.prepare(
          `
          INSERT INTO user_roles (user_id, role_id)
          VALUES (?, ?)
        `,
        ).run(user.id, user.role_id);
      }
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
      const user = db
        .prepare(
          `
        SELECT username FROM users WHERE id = ?
      `,
        )
        .get(id);

      if (user?.username === "superadmin") {
        return {
          success: false,
          error: "Cannot delete superadmin user",
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

async function createSuperAdmin(db) {
  const existing = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get("superadmin");

  if (!existing) {
    const hashedPassword = await bcrypt.hash("jamal@1231", 10);

    db.prepare(
      `
      INSERT INTO users (username, password_hash, full_name, email, status)
      VALUES (?, ?, ?, ?, ?)
    `,
    ).run(
      "superadmin",
      hashedPassword,
      "Super Admin",
      "superadmin@gmail.com",
      "Active",
    );

    console.log("✅ Super admin created with hashed password");
  }
}

module.exports = { registerUserHandlers, createSuperAdmin };
