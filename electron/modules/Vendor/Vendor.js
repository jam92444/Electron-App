const { ipcMain } = require("electron");

function registerVendorHandlers(db) {
  // ---------- GET VENDORS ----------
  ipcMain.handle("db:getVendors", () => {
    try {
      const vendors = db.prepare(`SELECT * FROM vendors`).all();
      return { success: true, data: vendors };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ---------- INSERT VENDOR ----------
  const insertVendorTx = db.transaction((vendor) => {
    db.prepare(
      `
      INSERT INTO vendors (
        vendorName, contactPerson, phone, whatsapp, email, address1, address2,
        city, state, country, gstType, gstNumber, bankName, accountHolder,
        accountNumber, ifsc, upi, paymentTerms, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      vendor.vendorName,
      vendor.contactPerson || null,
      vendor.phone,
      vendor.whatsapp || null,
      vendor.email,
      vendor.address1,
      vendor.address2 || null,
      vendor.city,
      vendor.state,
      vendor.country || "IN",
      vendor.gstType || null,
      vendor.gstNumber || null,
      vendor.bankName || null,
      vendor.accountHolder || null,
      vendor.accountNumber || null,
      vendor.ifsc || null,
      vendor.upi || null,
      vendor.paymentTerms || "30 Days",
      vendor.status || "Active",
    );
  });

  ipcMain.handle("db:insertVendor", (e, vendor) => {
    try {
      // Check for duplicate email or phone
      const exists = db
        .prepare("SELECT 1 FROM vendors WHERE  phone = ? or vendorName= ?")
        .get(vendor.phone, vendor.vendorName);

      if (exists) {
        return { success: false, error: "VENDOR ALREADY EXISTS" };
      }

      insertVendorTx(vendor);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ---------- UPDATE VENDOR ----------
  const updateVendorTx = db.transaction((vendor) => {
    db.prepare(
      `
      UPDATE vendors SET
        vendorName = ?, contactPerson = ?, phone = ?, whatsapp = ?, email = ?,
        address1 = ?, address2 = ?, city = ?, state = ?, country = ?,
        gstType = ?, gstNumber = ?, bankName = ?, accountHolder = ?, accountNumber = ?,
        ifsc = ?, upi = ?, paymentTerms = ?, status = ?
      WHERE id = ?
    `,
    ).run(
      vendor.vendorName,
      vendor.contactPerson || null,
      vendor.phone,
      vendor.whatsapp || null,
      vendor.email,
      vendor.address1,
      vendor.address2 || null,
      vendor.city,
      vendor.state,
      vendor.country || "IN",
      vendor.gstType || null,
      vendor.gstNumber || null,
      vendor.bankName || null,
      vendor.accountHolder || null,
      vendor.accountNumber || null,
      vendor.ifsc || null,
      vendor.upi || null,
      vendor.paymentTerms || "30 Days",
      vendor.status || "Active",
      vendor.id,
    );
  });

  ipcMain.handle("db:updateVendor", (e, vendor) => {
    try {
      const exists = db
        .prepare("SELECT 1 FROM vendors WHERE id = ?")
        .get(vendor.id);

      if (!exists) {
        return { success: false, error: "VENDOR_NOT_FOUND" };
      }

      updateVendorTx(vendor);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ---------- DELETE VENDOR ----------
  ipcMain.handle("db:deleteVendor", (e, vendorID) => {
    try {
      db.prepare("DELETE FROM vendors WHERE id = ?").run(vendorID);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ---------- FILTER VENDOR ----------
  ipcMain.handle("db:filterVendors", (e, filters) => {
    try {
      let query = "SELECT * FROM vendors WHERE 1=1";
      const params = [];

      if (filters.vendorName) {
        query += " AND vendorName LIKE ?";
        params.push(`%${filters.vendorName}%`);
      }
      if (filters.city) {
        query += " AND city LIKE ?";
        params.push(`%${filters.city}%`);
      }
      if (filters.state) {
        query += " AND state LIKE ?";
        params.push(`%${filters.state}%`);
      }
      if (filters.status) {
        query += " AND status = ?";
        params.push(filters.status);
      }

      const vendors = db.prepare(query).all(...params);
      return { success: true, vendors };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("db.getNoOfVendorCount", async () => {
    try {
      const query = `
      SELECT COUNT(*) AS totalVendor
      FROM vendors
    `;

      const result = db.prepare(query).get();
      const totalVendor = result?.totalVendor ?? 0;

      return {
        success: true,
        data: totalVendor,
      };
    } catch (err) {
      console.error("db.getNoOfVendorCount error:", err);

      return {
        success: false,
        error: "Failed to fetch vendor count",
      };
    }
  });
}

module.exports = { registerVendorHandlers };
