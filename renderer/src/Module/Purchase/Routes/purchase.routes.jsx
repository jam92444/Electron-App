import { withSuspense } from "../../../Router/withSuspense";
import PurchaseCreate from "../Pages/PurchaseCreate";
import PurchaseDashboard from "../Pages/PurchaseDashboard";
import PurchaseView from "../Pages/PurchaseView";

export const PurchaseRoutes = [
  // Masters
  { path: "purchase", element: withSuspense(<PurchaseDashboard />) },
  { path: "purchase/new", element: withSuspense(<PurchaseCreate />) },
  { path: "purchase/:id", element: withSuspense(<PurchaseView />) },
];
