// ---------- SAVE BILL ----------
export const saveBill = (bill, items) => window.api.saveBill(bill, items);

// ---------- UPDATE BILL ----------
export const updateBill = (billId, bill, items) =>
  window.api.updateBill(billId, bill, items);

// ---------- GET ALL BILLS (PAGINATED) ----------
export const getBills = ({ page = 1, pageSize = 10 } = {}) =>
  window.api.getBills({ page, pageSize });

// ---------- GET SINGLE BILL ----------
export const getBillById = (billId) => window.api.getBillById(billId);

// ---------- DELETE BILL ----------
export const deleteBill = (billId) => window.api.deleteBill(billId);

export const getSalesDashboard = (fromDate, toDate) =>
  window.api.getSalesDashboard({ fromDate, toDate });
