// Service for Expenses module

export const getExpenses = () => window.api.getExpenses();

export const getExpensesByDateRange = (range) =>
  window.api.getExpensesByDateRange(range);

export const getExpenseSummary = (range) => window.api.getExpenseSummary(range);

export const createExpense = (expense) => window.api.insertExpense(expense);

export const updateExpense = (expense) => window.api.updateExpense(expense);

export const deleteExpense = (id) => window.api.deleteExpense(id);

// ── Categories ──

export const getExpenseCategories = () => window.api.getExpenseCategories();

export const createExpenseCategory = (name) =>
  window.api.insertExpenseCategory(name);

export const deleteExpenseCategory = (id) =>
  window.api.deleteExpenseCategory(id);
