import { withSuspense } from "../../../Router/withSuspense";
import { CompanySetting } from "./Setting.lazyImport";

export const SettingRoutes = [
  {
    path: "setting/company-details",
    element: withSuspense(<CompanySetting />),
  },
];
