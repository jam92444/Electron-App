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

/* ---------------- DASHBOARD SERVICES ---------------- */

export const getDashboardSummary = () => window.api.getDashboardSummary();

export const getPurchaseTrend = (days = 7) => window.api.getPurchaseTrend(days);

export const getTopVendors = () => window.api.getTopVendors();

export const getRecentPurchases = () => window.api.getRecentPurchases();

export const getLowStockItems = () => window.api.getLowStockItems();

export const getVariantStockSummary = () => window.api.getVariantStockSummary();

export const getMonthlyPurchaseSummary = () =>
  window.api.getMonthlyPurchaseSummary();

export const getVendorStatusStats = () => window.api.getVendorStatusStats();

/**
 * One-call dashboard loader
 * Returns:
 * {
 *   summary,
 *   purchaseTrend,
 *   topVendors,
 *   recentPurchases,
 *   lowStock
 * }
 */
export const getDashboardData = () => window.api.getDashboardData();
