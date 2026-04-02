import { withSuspense } from "../../../Router/withSuspense";
import { Reports } from "./reports.lazy";

export const ReportRoutes = [
  { path: "reports", element: withSuspense(<Reports />) },
];
