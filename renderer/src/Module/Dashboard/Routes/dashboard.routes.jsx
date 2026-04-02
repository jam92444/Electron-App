import { withSuspense } from "../../../Router/withSuspense";
import { Home } from "./dashboard.lazyimports";

export const DashboardRoutes = [
  { path: "/", element: withSuspense(<Home />) },
];
