const { ipcMain } = require("electron");

function registerSettingsHandlers(db) {
  /* ---------- GET SETTINGS ---------- */
  ipcMain.handle("db:getSettings", () => {
    try {
      const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
      return { success: true, data: settings || {} };
    } catch (err) {
      console.error("❌ db:getSettings", err);
      return { success: false, data: {} };
    }
  });

  /* ---------- UPDATE COMPANY SETTINGS ---------- */
  ipcMain.handle("db:updateCompanySettings", (event, payload = {}) => {
    try {
      db.prepare(
        `
        INSERT INTO settings (id, companyName, gstTin, contactNumber, companyEmail)
        VALUES (1, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          companyName = excluded.companyName,
          gstTin = excluded.gstTin,
          contactNumber = excluded.contactNumber,
          companyEmail = excluded.companyEmail
      `,
      ).run(
        payload.companyName || "",
        payload.gstTin || "",
        payload.contactNumber || "",
        payload.companyEmail || "",
      );

      return {
        success: true,
        message: "Company settings updated successfully",
      };
    } catch (err) {
      console.error("❌ db:updateCompanySettings", err);
      return { success: false, message: "Failed to update company settings" };
    }
  });

  /* ---------- UPDATE BILLING SETTINGS ---------- */
  ipcMain.handle("db:updateBillingSettings", (event, payload = {}) => {
    try {
      db.prepare(
        `
        INSERT INTO settings (id, fullAddress, country, state, city, pinCode)
        VALUES (1, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          fullAddress = excluded.fullAddress,
          country = excluded.country,
          state = excluded.state,
          city = excluded.city,
          pinCode = excluded.pinCode
      `,
      ).run(
        payload.fullAddress || "",
        payload.country || "",
        payload.state || "",
        payload.city || "",
        payload.pinCode || "",
      );

      return {
        success: true,
        message: "Billing settings updated successfully",
      };
    } catch (err) {
      console.error("❌ db:updateBillingSettings", err);
      return { success: false, message: "Failed to update billing settings" };
    }
  });

  /* ---------- UPDATE OTHER SETTINGS ---------- */
  ipcMain.handle("db:updateOtherSettings", (event, payload = {}) => {
    try {
      db.prepare(
        `
        INSERT INTO settings (id, supportContact, website, termsConditions, invoicePrefix, enableInvoicePrefix)
        VALUES (1, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          supportContact = excluded.supportContact,
          website = excluded.website,
          termsConditions = excluded.termsConditions,
          invoicePrefix = excluded.invoicePrefix,
          enableInvoicePrefix = excluded.enableInvoicePrefix
      `,
      ).run(
        payload.supportContact || "",
        payload.website || "",
        payload.termsConditions || "",
        payload.invoicePrefix || "",
        payload.enableInvoicePrefix ? 1 : 0,
      );

      return { success: true, message: "Other settings updated successfully" };
    } catch (err) {
      console.error("❌ db:updateOtherSettings", err);
      return { success: false, message: "Failed to update other settings" };
    }
  });

  /* ---------- RESET INVOICE NUMBER ---------- */
  ipcMain.handle("db:resetInvoiceNumber", () => {
    try {
      db.prepare(
        `
        INSERT INTO settings (id, lastInvoiceNumber)
        VALUES (1, 0)
        ON CONFLICT(id) DO UPDATE SET lastInvoiceNumber = 0
      `,
      ).run();

      return { success: true, message: "Invoice number reset successfully" };
    } catch (err) {
      console.error("❌ db:resetInvoiceNumber", err);
      return { success: false, message: "Failed to reset invoice number" };
    }
  });

  console.log("✅ Settings IPC handlers registered (safe for missing row)");
}

module.exports = { registerSettingsHandlers };
