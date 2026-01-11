import { withSuspense } from "../../../Router/withSuspense";
import { Discounts } from "./discount.lazyimports";

export const discountRoutes = [
      { path: "discounts", element: withSuspense(<Discounts />) },
]