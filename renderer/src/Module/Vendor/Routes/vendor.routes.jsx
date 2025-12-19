import { withSuspense } from "../../../Router/withSuspense";
import { VendorMaster } from "./vendor.lazyImports";

export const VendorRoutes = [
  {
    path: "vendor/add-vendor",
    element: withSuspense(<VendorMaster />),
  },
];
