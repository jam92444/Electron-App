const { ipcMain, dialog, app, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const { backupDatabase, saveBackupPath, getBackupPath } = require("../../db/db");

function registerBackupHandlers() {
  // Manual backup
  ipcMain.handle("db:backup-db", async () => {
    return await backupDatabase();
  });

  // Get list of backups
  ipcMain.handle("db:get-backups", async () => {
    const backupDir = getBackupPath() || path.join(app.getPath("documents"), "InviOX_Backups");

    if (!fs.existsSync(backupDir)) return [];

    const files = fs.readdirSync(backupDir).sort().reverse();

    return files.map((file) => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);

      return {
        name: file,
        size: (stats.size / 1024).toFixed(2) + " KB",
        date: stats.mtime.toLocaleString(),
      };
    });
  });

  // Open backup folder
  ipcMain.handle("db:open-backup-folder", async () => {
    const backupDir = getBackupPath() || path.join(app.getPath("documents"), "InviOX_Backups");
    return shell.openPath(backupDir);
  });

  // Select folder via dialog
  ipcMain.handle("db:select-backup-folder", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });

    if (result.canceled) return null;
    return result.filePaths[0];
  });

  // Save selected folder path
  ipcMain.handle("db:set-backup-path", async (event, folderPath) => {
    saveBackupPath(folderPath);
    return true;
  });

  // Return current path
  ipcMain.handle("db:get-backup-path", async () => {
    return getBackupPath();
  });
}

module.exports = { registerBackupHandlers };