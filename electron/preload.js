const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getItems: () => ipcRenderer.invoke("db:getItems"),
  insertItem: (item) => ipcRenderer.invoke("db:insertItem", item),
  updateItem: (item) => ipcRenderer.invoke("db:updateItem", item),
  deleteItem: (itemId) => ipcRenderer.invoke("db:deleteItem", itemId),
  filterItems: (filters) => ipcRenderer.invoke("db:filterItems", filters),
  getSizes: () => ipcRenderer.invoke("db:getSizes"),
  insertSize: (size) => ipcRenderer.invoke("db:insertSize", size),
  updateSize: (id, newSize) =>
    ipcRenderer.invoke("db:updateSize", { id, newSize }),
  deleteSize: (id) => ipcRenderer.invoke("db:deleteSize", id),
  filterSizes: (filters) => ipcRenderer.invoke("db:filterSizes", filters),
  getBills: () => ipcRenderer.invoke("db:getBills"),
  getBillById: (billId) => ipcRenderer.invoke("db:getBillById", billId),
  saveBill: (bill, items) => ipcRenderer.invoke("db:saveBill", bill, items),
  updateBill: (billId, bill, items) =>
    ipcRenderer.invoke("db:updateBill", billId, bill, items),
  deleteBill: (billId) => ipcRenderer.invoke("db:deleteBill", billId),
  filterBills: (filters) => ipcRenderer.invoke("db:filterBills", filters),
  getVendors: () => ipcRenderer.invoke("db:getVendors"),
  insertVendor: (vendor) => ipcRenderer.invoke("db:insertVendor", vendor),
  updateVendor: (vendor) => ipcRenderer.invoke("db:updateVendor", vendor),
  deleteVendor: (vendorId) => ipcRenderer.invoke("db:deleteVendor", vendorId),
  filterVendors: (filters) => ipcRenderer.invoke("db:filterVendors", filters),
});
