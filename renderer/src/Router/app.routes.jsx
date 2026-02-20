import AppLayout from "../Layout/AppLayout";
import { labelRoutes } from "../Module/Label/Routes/label.routes";
import { BillingRoutes } from "../Module/Billing/Routers/bills.routes";
import { SettingRoutes } from "../Module/Settings/Routes/setting.routes";
import { ItemsRoutes } from "../Module/Items/Routers/items.routes";
import { DashboardRoutes } from "../Module/Dashboard/Routes/dashboard.routes";
import { VendorRoutes } from "../Module/Vendor/Routes/vendor.routes";
import { discountRoutes } from "../Module/Discount/Routes/discount.routes";
import { CustomerRoutes } from "../Module/Customer/Routes/customer.routes";
import { PurchaseRoutes } from "../Module/Purchase/Routes/purchase.routes";
import { userRoutes } from "../Module/User/Routes/user.routes";

export const appRoutes = [
  {
    path: "/",
    element: <AppLayout />, // layout should NOT be wrapped in suspense
    children: [
      //Dashboard Module routes
      ...DashboardRoutes,

      // Items Module Routes
      ...ItemsRoutes,

      // Vendor Routes
      ...VendorRoutes,

      // Settings Module Routes
      ...SettingRoutes,

      // Billing  Module Routes
      ...BillingRoutes,

      // Label Module Routes
      ...labelRoutes,

      // Discount Module Routes
      ...discountRoutes,

      // Customer Module Routes
      ...CustomerRoutes,

      // Purchase Module Routes
      ...PurchaseRoutes,

      // User Module Routes
      ...userRoutes,
    ],
  },
];
