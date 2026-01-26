/* ---------------- PURCHASE SERVICES ---------------- */

export const createPurchase = (purchase) => window.api.createPurchase(purchase);

export const getPurchaseById = (purchaseId) =>
  window.api.getPurchaseById(purchaseId);

export const updatePurchase = (purchase) => window.api.updatePurchase(purchase);

export const deletePurchase = (purchaseId) =>
  window.api.deletePurchase(purchaseId);

/* ----------------- PURCHASE ITEMS ----------------- */

// Insert a purchase item (with quantity support)
export const insertPurchaseItem = (item) => window.api.insertPurchaseItem(item);

// Update an existing purchase item (new handler for quantity/variants)
export const updatePurchaseItem = (item) => window.api.updatePurchaseItem(item);

export const getPurchaseListCursor = (options) =>
  window.api.getPurchaseListCursor(options);
