import { withSuspense } from "../../../Router/withSuspense";
import AddItem from "../Pages/AddItem";
import Size from "../Pages/Size";

export const ItemsRoutes = [
  // Masters
  { path: "add-item", element: withSuspense(<AddItem />) },
  { path: "size", element: withSuspense(<Size />) },
];
