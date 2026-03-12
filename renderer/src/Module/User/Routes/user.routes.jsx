import { lazy } from "react";
import { withSuspense } from "../../../Router/withSuspense";

const UserManagement = lazy(() => import("../Pages/AddUser"));
const UserProfile = lazy(() => import("../Pages/UserProfile"));

export const userRoutes = [
  {
    path: "users",
    element: withSuspense(<UserManagement />),
  },
  {
    path: "users/profile",
    element: withSuspense(<UserProfile />),
  },
];
