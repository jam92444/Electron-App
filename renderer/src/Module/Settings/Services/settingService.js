// Service for Settings module

/* -------- Get all settings -------- */
export const getSettings = () => window.api.getSettings();

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
export const resetInvoiceNumber = () =>
  window.api.resetInvoiceNumber();
