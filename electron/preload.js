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
});
