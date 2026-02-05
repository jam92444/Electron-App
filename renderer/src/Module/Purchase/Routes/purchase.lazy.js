import { lazy } from "react";

export const PurchaseDashBoard = lazy(
  () => import("../Pages/PurchaseDashboard"),
);
export const PurchaseCreate = lazy(() => import("../Pages/PurchaseCreate"));
export const PurchaseView = lazy(() => import("../Pages/PurchaseView"));
