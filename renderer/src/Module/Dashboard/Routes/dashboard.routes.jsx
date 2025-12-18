import { withSuspense } from "../../../Router/withSuspense";
import { Home } from "./dashboard.lazyimports";

export const DashboardRoutes = [
  { index: true, element: withSuspense(<Home />) },
];
