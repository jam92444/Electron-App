const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // -----------------------------
  // ITEMS
  // -----------------------------
  getItems: () => ipcRenderer.invoke("db:getItems"),
  insertItem: (item) => ipcRenderer.invoke("db:insertItem", item),
  updateItem: (item) => ipcRenderer.invoke("db:updateItem", item),
  deleteItem: (itemId) => ipcRenderer.invoke("db:deleteItem", itemId),

  // -----------------------------
  // SIZES
  // -----------------------------
  getSizes: () => ipcRenderer.invoke("db:getSizes"),
  insertSize: (size) => ipcRenderer.invoke("db:insertSize", size),
  updateSize: (id, newSize) =>
    ipcRenderer.invoke("db:updateSize", { id, newSize }),
  deleteSize: (id) => ipcRenderer.invoke("db:deleteSize", id),

  // -----------------------------
  // Billing
  // -----------------------------

  saveBill: (bill, items) => ipcRenderer.invoke("db:saveBill", bill, items),

  updateBill: (billId, bill, items) =>
    ipcRenderer.invoke("db:updateBill", billId, bill, items),

  getBills: () => ipcRenderer.invoke("db:getBills"),

  getBillById: (billId) => ipcRenderer.invoke("db:getBillById", billId),

  deleteBill: (billId) => ipcRenderer.invoke("db:deleteBill", billId),
});
