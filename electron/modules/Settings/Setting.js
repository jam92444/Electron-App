const { ipcMain } = require("electron");

function registerSettingsHandlers(db) {
  /* ---------- GET SETTINGS ---------- */
  ipcMain.handle("db:getSettings", () => {
    try {
      const settings = db
        .prepare("SELECT * FROM settings WHERE id = 1")
        .get();

      return { success: true, data: settings };
    } catch (err) {
      console.error("❌ db:getSettings", err);

      // Always success, return empty object
      return { success: true, data: {} };
    }
  });

  /* ---------- UPDATE COMPANY SETTINGS ---------- */
  ipcMain.handle("db:updateCompanySettings", (event, payload = {}) => {
    try {
      db.prepare(`
        UPDATE settings SET
          companyName = ?,
          gstTin = ?,
          contactNumber = ?,
          companyEmail = ?
        WHERE id = 1
      `).run(
        payload.companyName || "",
        payload.gstTin || "",
        payload.contactNumber || "",
        payload.companyEmail || ""
      );
    } catch (err) {
      console.error("❌ db:updateCompanySettings", err);
    }

    return { success: true };
  });

  /* ---------- UPDATE BILLING SETTINGS ---------- */
  ipcMain.handle("db:updateBillingSettings", (event, payload = {}) => {
    try {
      db.prepare(`
        UPDATE settings SET
          fullAddress = ?,
          country = ?,
          state = ?,
          city = ?,
          pinCode = ?
        WHERE id = 1
      `).run(
        payload.fullAddress || "",
        payload.country || "",
        payload.state || "",
        payload.city || "",
        payload.pinCode || ""
      );
    } catch (err) {
      console.error("❌ db:updateBillingSettings", err);
    }

    return { success: true };
  });

  /* ---------- UPDATE OTHER SETTINGS ---------- */
  ipcMain.handle("db:updateOtherSettings", (event, payload = {}) => {
    try {
      db.prepare(`
        UPDATE settings SET
          supportContact = ?,
          website = ?,
          termsConditions = ?,
          invoicePrefix = ?,
          enableInvoicePrefix = ?
        WHERE id = 1
      `).run(
        payload.supportContact || "",
        payload.website || "",
        payload.termsConditions || "",
        payload.invoicePrefix || "",
        payload.enableInvoicePrefix ? 1 : 0
      );
    } catch (err) {
      console.error("❌ db:updateOtherSettings", err);
    }

    return { success: true };
  });

  /* ---------- RESET INVOICE NUMBER ---------- */
  ipcMain.handle("db:resetInvoiceNumber", () => {
    try {
      db.prepare(`
        UPDATE settings
        SET lastInvoiceNumber = 0
        WHERE id = 1
      `).run();
    } catch (err) {
      console.error("❌ db:resetInvoiceNumber", err);
    }

    return { success: true };
  });

  console.log("✅ Settings IPC handlers registered (always success)");
}

module.exports = { registerSettingsHandlers };
