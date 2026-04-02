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

// Add this with the other PURCHASE ITEMS services

export const getPurchaseItems = (purchaseId) =>
  window.api.getPurchaseItems(purchaseId);

export const getPurchaseList = async ({
  page,
  pageSize,
  startDate,
  endDate,
}) => {
  return window.api.getPurchaseList("db:getPurchaseList", {
    page,
    pageSize,
    startDate,
    endDate,
  });
};

/* ---------------- DASHBOARD SERVICES ---------------- */

export const getDashboardSummary = ({ startDate, endDate } = {}) =>
  window.api.getDashboardSummary({ startDate, endDate });

export const getPurchaseTrend = ({ days = 30, startDate, endDate } = {}) =>
  window.api.getPurchaseTrend({ days, startDate, endDate });

export const getTopVendors = ({ startDate, endDate, limit = 5 } = {}) =>
  window.api.getTopVendors({ startDate, endDate, limit });

export const getRecentPurchases = ({ startDate, endDate, limit = 10 } = {}) =>
  window.api.getRecentPurchases({ startDate, endDate, limit });

export const getLowStockItems = ({ threshold = 2 } = {}) =>
  window.api.getLowStockItems({ threshold });

export const getVariantStockSummary = () => window.api.getVariantStockSummary();

export const getMonthlyPurchaseSummary = ({ year, startDate, endDate } = {}) =>
  window.api.getMonthlyPurchaseSummary({ year, startDate, endDate });

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
