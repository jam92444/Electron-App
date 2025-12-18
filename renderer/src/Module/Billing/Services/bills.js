// renderer/src/services/bills.js

// ---------- SAVE BILL ----------
export const saveBill = (bill, items) => window.api.saveBill(bill, items);

// ---------- UPDATE BILL ----------
export const updateBill = (billId, bill, items) =>
  window.api.updateBill(billId, bill, items);

// ---------- GET ALL BILLS ----------
export const getBills = () => window.api.getBills();

// ---------- GET SINGLE BILL ----------
export const getBillById = (billId) => window.api.getBillById(billId);

// ---------- DELETE BILL ----------
export const deleteBill = (billId) => window.api.deleteBill(billId);
