import AppLayout from "../Layout/AppLayout";
import { labelRoutes } from "../Module/Label/Routes/label.routes";
import { BillingRoutes } from "../Module/Billing/Routers/bills.routes";
import { SettingRoutes } from "../Module/Settings/Routes/setting.routes";
import { ItemsRoutes } from "../Module/Items/Routers/items.routes";
import { DashboardRoutes } from "../Module/Dashboard/Routes/dashboard.routes";

export const appRoutes = [
  {
    path: "/",
    element: <AppLayout />, // layout should NOT be wrapped in suspense
    children: [
      //Dashboard Module routes
      ...DashboardRoutes,

      // Items Module Routes
      ...ItemsRoutes,

      // Settings Module Routes
      ...SettingRoutes,

      // Billing  Module Routes
      ...BillingRoutes,

      // Label Module Routes
      ...labelRoutes,
    ],
  },
];
