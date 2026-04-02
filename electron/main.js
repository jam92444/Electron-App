// const { app, BrowserWindow, Menu, dialog } = require("electron");
// const path = require("path");
// const { initDatabase } = require("./db/db");
// const { registerItemHandlers } = require("./modules/Items/items");
// const { registerSizeHandlers } = require("./modules/Items/size");
// const { registerBillHandlers } = require("./modules/Billing/billHandlers");
// const { registerVendorHandlers } = require("./modules/Vendor/Vendor");
// const { registerPurchaseHandlers } = require("./modules/Purchase/Purchase");
// const { registerSettingsHandlers } = require("./modules/Settings/Setting");
// const { registerDiscountHandlers } = require("./modules/Discount/discount");
// const { registerCustomerHandlers } = require("./modules/Customer/customer");
// const { registerDashboardHandlers } = require("./modules/Purchase/Dashboard");
// const {
//   registerUserHandlers,
//   createSuperAdmin,
// } = require("./modules/Users/user");
// const registerRoleHandlers = require("./modules/Items/role");
// const registerAuthHandler = require("./modules/Auth/auth");
// const { registerExpenseHandlers } = require("./modules/Others/Expense");

// let mainWindow;
// let db;

// function createWindow() {
//   // ── Try to restore previous window size/position ──
//   let windowState = { x: undefined, y: undefined, width: 1200, height: 800 };
//   try {
//     const windowStateKeeper = require("electron-window-state");
//     const savedState = windowStateKeeper({
//       defaultWidth: 1200,
//       defaultHeight: 800,
//     });
//     windowState = savedState;
//   } catch {
//     // electron-window-state not installed — use defaults silently
//   }

//   mainWindow = new BrowserWindow({
//     x: windowState.x,
//     y: windowState.y,
//     width: windowState.width,
//     height: windowState.height,
//     minWidth: 800,
//     minHeight: 600,
//     show: false, // show only after ready-to-show to avoid flash
//     webPreferences: {
//       preload: path.join(__dirname, "preload.js"),
//       contextIsolation: true,
//       nodeIntegration: false,
//       sandbox: true,
//       devTools: process.env.NODE_ENV === "development",
//     },
//   });

//   // ── Manage window state if package is available ──
//   if (windowState.manage) windowState.manage(mainWindow);

//   // ── Hide native menu bar ──
//   // Menu.setApplicationMenu(null);

//   // ── Show window gracefully once ready ──
//   mainWindow.once("ready-to-show", () => {
//     mainWindow.show();

//     if (process.env.NODE_ENV === "development") {
//       mainWindow.webContents.openDevTools({ mode: "detach" });
//     }
//   });

//   // ── Load app ──
//   const devServerURL = process.env.VITE_DEV_SERVER_URL;
//   if (devServerURL && devServerURL.startsWith("http")) {
//     mainWindow.loadURL(devServerURL);
//     if (process.env.NODE_ENV === "development") {
//       mainWindow.webContents.openDevTools();
//     }
//   } else {
//     mainWindow.loadFile(path.join(__dirname, "../renderer/dist/index.html"));
//   }

//   // ── Prevent opening new windows from renderer ──
//   // mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

//   mainWindow.on("closed", () => {
//     mainWindow = null;
//   });
// }
// // ── App ready ──
// app.whenReady().then(async () => {
//   try {
//     db = initDatabase();
//     await createSuperAdmin(db);

//     registerItemHandlers(db);
//     registerSizeHandlers(db);
//     registerBillHandlers(db);
//     registerVendorHandlers(db);
//     registerPurchaseHandlers(db);
//     registerDashboardHandlers(db);
//     registerSettingsHandlers(db);
//     registerDiscountHandlers(db);
//     registerCustomerHandlers(db);
//     registerUserHandlers(db);
//     registerRoleHandlers(db);
//     registerAuthHandler(db);
//     registerExpenseHandlers(db);
//     createWindow();
//   } catch (err) {
//     console.error("Startup failed:", err);
//     dialog.showErrorBox(
//       "Startup Error",
//       "Failed to initialize the application.\n\nPlease reinstall the app or contact support.\n\n" +
//         err.message,
//     );
//     app.quit();
//   }
// });

// // ── Graceful DB shutdown ──
// app.on("before-quit", () => {
//   try {
//     if (db) db.close();
//   } catch (err) {
//     console.error("Failed to close database:", err);
//   }
// });

// // ── Quit on all windows closed (Windows / Linux) ──
// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") app.quit();
// });

// // ── Re-create window on dock click (macOS) ──
// app.on("activate", () => {
//   if (BrowserWindow.getAllWindows().length === 0) createWindow();
// });

// // ── Block navigation to external URLs ──
// app.on("web-contents-created", (_, contents) => {
//   contents.on("will-navigate", (event, url) => {
//     const isDev = process.env.VITE_DEV_SERVER_URL;
//     const isAllowed =
//       (isDev && url.startsWith(process.env.VITE_DEV_SERVER_URL)) ||
//       url.startsWith("file://");
//     if (!isAllowed) {
//       event.preventDefault();
//       console.warn("Blocked navigation to:", url);
//     }
//   });
// });



const { app, BrowserWindow, Menu } = require("electron"); // ✅ Added Menu 
const path = require("path"); 
const { initDatabase } = require("./db/db"); 
const { registerItemHandlers } = require("./modules/Items/items"); 
const { registerSizeHandlers } = require("./modules/Items/size"); 
const { registerBillHandlers } = require("./modules/Billing/billHandlers"); 
const { registerVendorHandlers } = require("./modules/Vendor/Vendor"); 
const { registerPurchaseHandlers } = require("./modules/Purchase/Purchase"); 
const { registerSettingsHandlers } = require("./modules/Settings/Setting"); 
const { registerDiscountHandlers } = require("./modules/Discount/discount"); 
const { registerCustomerHandlers } = require("./modules/Customer/customer"); 
const { registerDashboardHandlers } = require("./modules/Purchase/Dashboard"); 
const { 
  registerUserHandlers, 
  createSuperAdmin, 
} = require("./modules/Users/user"); 
const registerRoleHandlers = require("./modules/Items/role"); 
const registerAuthHandler = require("./modules/Auth/auth"); 
const { registerExpenseHandlers } = require("./modules/Others/Expense");

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

  // ✅ Hide the top menu for all platforms 
  Menu.setApplicationMenu(null); 

  if (process.env.VITE_DEV_SERVER_URL) { 
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL); 
    mainWindow.webContents.openDevTools(); 
  } else { 
    mainWindow.loadFile(path.join(__dirname, "../renderer/dist/index.html")); 
  } 
} 

app.whenReady().then(async () => { 
  db = initDatabase(); 

  // Create super admin securely 
  await createSuperAdmin(db); 

  // Register IPC handlers 
  registerItemHandlers(db); 
  registerSizeHandlers(db); 
  registerBillHandlers(db); 
  registerVendorHandlers(db); 
  registerPurchaseHandlers(db); 
  registerDashboardHandlers(db); 
  registerSettingsHandlers(db); 
  registerDiscountHandlers(db); 
  registerCustomerHandlers(db); 
  registerUserHandlers(db); 
  registerRoleHandlers(db); 
  registerAuthHandler(db); 
  registerExpenseHandlers(db)
  createWindow(); 
}); 

app.on("window-all-closed", () => { 
  if (process.platform !== "darwin") app.quit(); 
}); 

app.on("activate", () => { 
  if (BrowserWindow.getAllWindows().length === 0) createWindow(); 
}); 