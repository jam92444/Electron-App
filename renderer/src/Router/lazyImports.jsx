import { lazy } from "react";

// Auth
export const Signup = lazy(() => import("../pages/Auth/Signup"));
export const Login = lazy(() => import("../pages/Auth/Login"));
export const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword"));
export const VerifyEmailMessagePage = lazy(() =>
  import("../pages/Auth/VerifyEmailMessagePage")
);
export const ResetPassword = lazy(() =>
  import("../pages/Auth/ResetPassword")
);

// Dashboard
export const Home = lazy(() => import("../pages/Auth/Home"));
export const AddItem = lazy(() => import("../pages/Dashboard/items/AddItem"));
export const Size = lazy(() => import("../pages/Dashboard/items/Size"));
export const Discounts = lazy(() => import("../pages/Dashboard/items/Discounts"));

// Settings
export const CompanySetting = lazy(() =>
  import("../pages/Dashboard/Settings/CompanySetting")
);

// Billing
export const GenerateBills = lazy(() =>
  import("../pages/Dashboard/Billing/GenerateBill")
);

// Label
export const GenerateLabel = lazy(() =>
  import("../pages/Dashboard/Label/GenerateLabel")
);
