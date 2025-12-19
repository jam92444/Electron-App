// ---------- GET ALL VENDORS ----------
export const getVendors = () => window.api.getVendors();

// ---------- INSERT VENDOR ----------
export const insertVendor = (vendorData) => window.api.insertVendor(vendorData);

// ---------- UPDATE VENDOR ----------
export const updateVendor = (vendorData) => window.api.updateVendor(vendorData);

// ---------- DELETE VENDOR ----------
export const deleteVendor = (vendorId) => window.api.deleteVendor(vendorId);

// ---------- FILTER VENDORS ----------
export const filterVendors = (filters) => window.api.filterVendors(filters);
