import { GenerateBills, SalesBill } from "./bills.lazyimports";
import { withSuspense } from "../../../Router/withSuspense";

export const BillingRoutes = [
  {
    path: "billing/generate-bill",
    element: withSuspense(<GenerateBills />),
  },
  { path: "billing/sales-bill", element: withSuspense(<SalesBill />) },
];
  