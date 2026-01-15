import { lazy } from "react";

// Label
export const VendorMaster = lazy(() => import("../Pages/Vendor"));

export const ManageVendor = lazy(() => import("../Pages/ManageVendor"));

export const VendorBankDetails = lazy(() =>
  import("../Components/VendorBankDetails")
);

export const VendorBasicDetails = lazy(() =>
  import("../Components/VendorBasicDetails")
);
