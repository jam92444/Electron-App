import { withSuspense } from "../../../Router/withSuspense";
import { ManageVendor, VendorMaster } from "./vendor.lazyImports";

export const VendorRoutes = [
  {
    path: "vendor/add-vendor",
    element: withSuspense(<VendorMaster />),
  },
  {
    path: "vendor/manage-vendor",
    element: withSuspense(<ManageVendor />),
  },
];
