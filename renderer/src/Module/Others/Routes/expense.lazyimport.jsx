import { lazy } from "react";

// Label
export const Expense = lazy(() =>
  import("../Pages/Expense")
);
export const AddExpenseForm = lazy(() =>
  import("../Pages/AddExpenseForm")
);
export const ViewAllExpenses = lazy(() =>
  import("../Pages/Viewallexpenses")
);
