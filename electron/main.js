const { app, BrowserWindow } = require("electron");
const path = require("path");
const { initDatabase } = require("./db/db");
const { registerItemHandlers } = require("./modules/Items/items");
const { registerSizeHandlers } = require("./modules/Items/size");
const { registerBillHandlers } = require("./modules/Billing/billHandlers");
const { registerVendorHandlers } = require("./modules/Vendor/Vendor");
const { registerPurchaseHandlers } = require("./modules/Purchase/Purchase");
const { registerSettingsHandlers } = require("./modules/Settings/Setting");

let mainWindow;
let db;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/dist/index.html"));
  }
}

app.whenReady().then(() => {
  db = initDatabase();

  // 🔐 Register IPC handlers ONCE
  registerItemHandlers(db);
  registerSizeHandlers(db);
  registerBillHandlers(db);
  registerVendorHandlers(db);
  registerPurchaseHandlers(db);
  registerSettingsHandlers(db)
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
