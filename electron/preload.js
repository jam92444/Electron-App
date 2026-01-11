const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  /* ----------------- Items ----------------- */
  getItems: () => ipcRenderer.invoke("db:getItems"),
  insertItem: (item) => ipcRenderer.invoke("db:insertItem", item),
  updateItem: (item) => ipcRenderer.invoke("db:updateItem", item),
  deleteItem: (itemId) => ipcRenderer.invoke("db:deleteItem", itemId),
  filterItems: (filters) => ipcRenderer.invoke("db:filterItems", filters),

  /* ----------------- Sizes ----------------- */
  getSizes: () => ipcRenderer.invoke("db:getSizes"),
  insertSize: (size) => ipcRenderer.invoke("db:insertSize", size),
  updateSize: (id, newSize) =>
    ipcRenderer.invoke("db:updateSize", { id, newSize }),
  deleteSize: (id) => ipcRenderer.invoke("db:deleteSize", id),
  filterSizes: (filters) => ipcRenderer.invoke("db:filterSizes", filters),

  /* ----------------- Bills ----------------- */
  getBills: () => ipcRenderer.invoke("db:getBills"),
  getBillById: (billId) => ipcRenderer.invoke("db:getBillById", billId),
  saveBill: (bill, items) => ipcRenderer.invoke("db:saveBill", bill, items),
  updateBill: (billId, bill, items) =>
    ipcRenderer.invoke("db:updateBill", billId, bill, items),
  deleteBill: (billId) => ipcRenderer.invoke("db:deleteBill", billId),
  filterBills: (filters) => ipcRenderer.invoke("db:filterBills", filters),

  /* ----------------- Customers ----------------- */
  createCustomer: (customer) =>
    ipcRenderer.invoke("db:createCustomer", customer),

  getCustomers: () => ipcRenderer.invoke("db:getCustomers"),

  updateCustomer: (customer) =>
    ipcRenderer.invoke("db:updateCustomer", customer),

  deleteCustomer: (id) => ipcRenderer.invoke("db:deleteCustomer", id),

  /* ----------------- Vendors ----------------- */
  getVendors: () => ipcRenderer.invoke("db:getVendors"),
  insertVendor: (vendor) => ipcRenderer.invoke("db:insertVendor", vendor),
  updateVendor: (vendor) => ipcRenderer.invoke("db:updateVendor", vendor),
  deleteVendor: (vendorId) => ipcRenderer.invoke("db:deleteVendor", vendorId),
  filterVendors: (filters) => ipcRenderer.invoke("db:filterVendors", filters),

  /* ----------------- Purchases ----------------- */
  createPurchase: (purchase, items) =>
    ipcRenderer.invoke("db:createPurchase", purchase, items),
  updatePurchase: (purchaseId, purchase, items) =>
    ipcRenderer.invoke("db:updatePurchase", purchaseId, purchase, items),
  deletePurchase: (purchaseId) =>
    ipcRenderer.invoke("db:deletePurchase", purchaseId),
  getPurchases: () => ipcRenderer.invoke("db:getPurchases"),
  getPurchaseById: (purchaseId) =>
    ipcRenderer.invoke("db:getPurchaseById", purchaseId),

  /* ----------------- Discounts ----------------- */
  getDiscounts: () => ipcRenderer.invoke("db:getDiscounts"),
  getDiscountById: (discountId) =>
    ipcRenderer.invoke("db:getDiscountById", discountId),
  createDiscount: (discount) =>
    ipcRenderer.invoke("db:createDiscount", discount),
  updateDiscount: (discountId, discount) =>
    ipcRenderer.invoke("db:updateDiscount", discountId, discount),
  deleteDiscount: (discountId) =>
    ipcRenderer.invoke("db:deleteDiscount", discountId),

  /* ================= SETTINGS ================= */

  getSettings: () => ipcRenderer.invoke("db:getSettings"),
  updateCompanySettings: (data) =>
    ipcRenderer.invoke("db:updateCompanySettings", data),
  updateBillingSettings: (data) =>
    ipcRenderer.invoke("db:updateBillingSettings", data),
  updateOtherSettings: (data) =>
    ipcRenderer.invoke("db:updateOtherSettings", data),
  resetInvoiceNumber: () => ipcRenderer.invoke("db:resetInvoiceNumber"),
});
