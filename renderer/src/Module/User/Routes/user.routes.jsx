import { lazy } from "react";
import { withSuspense } from "../../../Router/withSuspense";

const UserManagement = lazy(() => import("../Pages/User"));

export const userRoutes = [
  {
    path: "users",
    element: withSuspense(<UserManagement />),
  },
];
