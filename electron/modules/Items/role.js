const { ipcMain } = require("electron");

function registerRoleHandlers(db) {
  /* =====================================================
     GET ALL ROLES
  ===================================================== */
  ipcMain.handle("db:getRoles", async () => {
    try {
      const roles = db
        .prepare(
          `
        SELECT id, name, description, created_at
        FROM roles
        ORDER BY created_at DESC
      `,
        )
        .all();

      return { success: true, roles };
    } catch (error) {
      console.error("GET ROLES ERROR:", error);
      return { success: false, error: "Failed to fetch roles" };
    }
  });

  /* =====================================================
     GET ALL PERMISSIONS
  ===================================================== */
  ipcMain.handle("db:getPermissions", async () => {
    try {
      const permissions = db
        .prepare(
          `
        SELECT id, permission_key, description
        FROM permissions
        ORDER BY permission_key ASC
      `,
        )
        .all();

      return { success: true, permissions };
    } catch (error) {
      console.error("GET PERMISSIONS ERROR:", error);
      return { success: false, error: "Failed to fetch permissions" };
    }
  });

  /* =====================================================
     CREATE ROLE
  ===================================================== */
  ipcMain.handle("db:createRole", async (event, role) => {
    try {
      const exists = db
        .prepare(
          `
        SELECT id FROM roles WHERE name = ?
      `,
        )
        .get(role.name);

      if (exists) {
        return { success: false, error: "ROLE_EXISTS" };
      }

      const result = db
        .prepare(
          `
        INSERT INTO roles (name, description)
        VALUES (?, ?)
      `,
        )
        .run(role.name, role.description || "");

      return { success: true, roleId: result.lastInsertRowid };
    } catch (error) {
      console.error("CREATE ROLE ERROR:", error);
      return { success: false, error: "Failed to create role" };
    }
  });

  /* =====================================================
     UPDATE ROLE
  ===================================================== */
  ipcMain.handle("db:updateRole", async (event, role) => {
    try {
      const exists = db
        .prepare(
          `
        SELECT id FROM roles WHERE name = ? AND id != ?
      `,
        )
        .get(role.name, role.id);

      if (exists) {
        return { success: false, error: "ROLE_EXISTS" };
      }

      db.prepare(
        `
        UPDATE roles
        SET name = ?, description = ?
        WHERE id = ?
      `,
      ).run(role.name, role.description || "", role.id);

      return { success: true };
    } catch (error) {
      console.error("UPDATE ROLE ERROR:", error);
      return { success: false, error: "Failed to update role" };
    }
  });

  /* =====================================================
     DELETE ROLE
  ===================================================== */
  ipcMain.handle("db:deleteRole", async (event, id) => {
    try {
      // prevent deleting super_admin
      const role = db
        .prepare(
          `
        SELECT name FROM roles WHERE id = ?
      `,
        )
        .get(id);

      if (role?.name === "super_admin") {
        return { success: false, error: "Cannot delete super_admin role" };
      }

      db.prepare(`DELETE FROM roles WHERE id = ?`).run(id);

      return { success: true };
    } catch (error) {
      console.error("DELETE ROLE ERROR:", error);
      return { success: false, error: "Failed to delete role" };
    }
  });

  /* =====================================================
     GET ROLE PERMISSIONS
  ===================================================== */
  ipcMain.handle("db:getRolePermissions", async (event, roleId) => {
    try {
      const permissions = db
        .prepare(
          `
        SELECT p.id, p.permission_key
        FROM permissions p
        JOIN role_permissions rp ON rp.permission_id = p.id
        WHERE rp.role_id = ?
      `,
        )
        .all(roleId);

      return { success: true, permissions };
    } catch (error) {
      console.error("GET ROLE PERMISSIONS ERROR:", error);
      return { success: false };
    }
  });

  /* =====================================================
     ASSIGN PERMISSIONS TO ROLE
  ===================================================== */
  ipcMain.handle(
    "db:setRolePermissions",
    async (event, roleId, permissionIds) => {
      const trx = db.transaction(() => {
        db.prepare(`DELETE FROM role_permissions WHERE role_id = ?`).run(
          roleId,
        );

        const insertStmt = db.prepare(`
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES (?, ?)
      `);

        for (const pid of permissionIds) {
          insertStmt.run(roleId, pid);
        }
      });

      try {
        trx();
        return { success: true };
      } catch (error) {
        console.error("SET ROLE PERMISSIONS ERROR:", error);
        return { success: false };
      }
    },
  );
}

module.exports = registerRoleHandlers;
