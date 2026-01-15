import { withSuspense } from "../../../Router/withSuspense";
import Discounts from "../Pages/Discount";

export const discountRoutes = [
  { path: "discounts", element: withSuspense(<Discounts />) },
];
