import { lazy } from "react";

export const Discounts = lazy(() => import("../Pages/Discount"));
export const AddDiscountForm = lazy(() => import("../Components/AddDiscountForm"));
export const ViewAllDiscounts = lazy(() => import("../Components/ViewAllDiscounts"));