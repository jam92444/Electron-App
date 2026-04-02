import { withSuspense } from "../../../Router/withSuspense";
import AddItem from "../Pages/AddItem";
import Size from "../Pages/Size";

export const ItemsRoutes = [
  // Masters
  { path: "items", element: withSuspense(<AddItem />) },
  { path: "sizes", element: withSuspense(<Size />) },
];
