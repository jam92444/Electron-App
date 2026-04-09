// Service for Settings module

/* -------- Get all settings -------- */
export const getSettings = () => window.api.getSettings();

/* -------- Get all company details -------- */
export const getCompanyDetails = () => window.api.getSettings();

/* -------- Company Details -------- */
export const updateCompanySettings = (data) =>
  window.api.updateCompanySettings(data);

/* -------- Billing Details -------- */
export const updateBillingSettings = (data) =>
  window.api.updateBillingSettings(data);

/* -------- Other / Invoice Details -------- */
export const updateOtherSettings = (data) =>
  window.api.updateOtherSettings(data);

/* -------- Invoice Helpers -------- */
export const resetInvoiceNumber = () => window.api.resetInvoiceNumber();

export const getRoles = () => window.api.getRoles();
export const getPermissions = () => window.api.getPermissions();
export const createRole = (role) => window.api.createRole(role);
export const updateRole = (role) => window.api.updateRole(role);
export const deleteRole = (id) => window.api.deleteRole(id);
export const getRolePermissions = (id) => window.api.getRolePermissions(id);
export const setRolePermissions = (id, permissions) =>
  window.api.setRolePermissions(id, permissions);

export const backupDatabase = () => window.api.backupDatabase();
export const getBackups = () => window.api.getBackups();
export const openBackupFolder = () => window.api.openBackupFolder();
export const selectBackupFolder = () => window.api.selectBackupFolder();
export const setBackupPath = (path) => window.api.setBackupPath(path);
export const getBackupPath = () => window.api.getBackupPath();
