/* ---------------- PURCHASE SERVICES ---------------- */

export const createPurchase = (purchase) => window.api.createPurchase(purchase);

export const getPurchaseById = (purchaseId) =>
  window.api.getPurchaseById(purchaseId);

export const getPurchaseList = () => window.api.getPurchaseList();
export const updatePurchase = (purchase) => window.api.updatePurchase(purchase);

export const deletePurchase = (purchaseId) =>
  window.api.deletePurchase(purchaseId);
export const insertPurchaseItem = (purchase) =>
  window.api.insertPurchaseItem(purchase);
