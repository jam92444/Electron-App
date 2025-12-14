import AppLayout from "../Layout/AppLayout";
import { withSuspense } from "./withSuspense";
import {
  Home,
  AddItem,
  Size,
  Discounts,
  CompanySetting,
  GenerateBills,
  GenerateLabel,
} from "./lazyImports";

export const appRoutes = [
  {
    path: "/",
    element: <AppLayout />,  // layout should NOT be wrapped in suspense
    children: [
      { index: true, element: withSuspense(<Home />) },

      // Masters
      { path: "add-item", element: withSuspense(<AddItem />) },
      { path: "size", element: withSuspense(<Size />) },
      { path: "discounts", element: withSuspense(<Discounts />) },

      // Settings
      { path: "setting/company-details", element: withSuspense(<CompanySetting />) },

      // Billing
      { path: "billing/generate-bill", element: withSuspense(<GenerateBills />) },

      // Label
      { path: "label/generate-label", element: withSuspense(<GenerateLabel />) },
    ],
  },
];
