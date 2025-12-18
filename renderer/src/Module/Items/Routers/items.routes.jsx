import { withSuspense } from "../../../Router/withSuspense";
import { AddItem, Discounts, Size } from "./items.lazyimports";

export const ItemsRoutes = [
  // Masters
  { path: "add-item", element: withSuspense(<AddItem />) },
  { path: "size", element: withSuspense(<Size />) },
  { path: "discounts", element: withSuspense(<Discounts />) },
];
