// AppRoutes.jsx
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
// import { authRoutes } from "../Module/Auth/Routes/auth.routes";
import ProtectedRoute from "./ProtectedRoute";
import { Login } from "../Module/Auth/Routes/auth.lazyImports";

const protectedModules = [
  ...DashboardRoutes,
  ...ItemsRoutes,
  ...VendorRoutes,
  ...SettingRoutes,
  ...BillingRoutes,
  ...labelRoutes,
  ...discountRoutes,
  ...CustomerRoutes,
  ...PurchaseRoutes,
  ...userRoutes,
];

// Wrap each protected route's element with ProtectedRoute
const wrappedProtectedRoutes = protectedModules.map((route) => ({
  ...route,
  element: <ProtectedRoute>{route.element}</ProtectedRoute>,
}));

export const appRoutes = [
  {
    path: "/login",
    element: <Login />, // public route, no sidebar
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ), // protected layout
    children: [
      ...wrappedProtectedRoutes, // protected pages
    ],
  },
];
