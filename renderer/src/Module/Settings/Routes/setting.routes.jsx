import { withSuspense } from "../../../Router/withSuspense";
import AddRole from "../pages/AddRole";
import { CompanySetting } from "./Setting.lazyImport";

export const SettingRoutes = [
  {
    path: "setting/company-details",
    element: withSuspense(<CompanySetting />),
  },
  {
    path: "setting/config-permission",
    element: withSuspense(<AddRole />),
  },
];
