import { lazy } from "react";

export const GenerateBills = lazy(() => import("../Pages/GenerateBill"));

export const SalesBill = lazy(() => {
  import("../Pages/SalesBill");
});
