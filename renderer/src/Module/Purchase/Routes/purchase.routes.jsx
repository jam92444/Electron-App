import { withSuspense } from "../../../Router/withSuspense";
import {
  PurchaseCreate,
  PurchaseDashBoard,
  PurchaseView,
} from "./purchase.lazy";

export const PurchaseRoutes = [
  // Masters
  { path: "purchase", element: withSuspense(<PurchaseDashBoard />) },
  { path: "purchase/new", element: withSuspense(<PurchaseCreate />) },
  { path: "purchase/:id", element: withSuspense(<PurchaseView />) },
];
