import { withSuspense } from "../../../Router/withSuspense";
import { Expense } from "./expense.lazyimport";

  const ExpenseRoutes = [
  {
    path: "expense",
    element: withSuspense(<Expense />),
  },
];

export default ExpenseRoutes