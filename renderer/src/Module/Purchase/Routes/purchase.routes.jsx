import { withSuspense } from "../../../Router/withSuspense";
import PurchaseOrder from "../Pages/PurchaseOrder";

export const PurchaseRoutes = [
  // Masters
  { path: "purchaseorder", element: withSuspense(<PurchaseOrder />) },
];
