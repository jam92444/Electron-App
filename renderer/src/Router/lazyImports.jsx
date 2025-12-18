import { lazy } from "react";

// Auth
export const Signup = lazy(() => import("../Module/Auth/Signup"));
export const Login = lazy(() => import("../Module/Auth/Login"));
export const ForgotPassword = lazy(() =>
  import("../Module/Auth/ForgotPassword")
);
export const VerifyEmailMessagePage = lazy(() =>
  import("../Module/Auth/VerifyEmailMessagePage")
);
export const ResetPassword = lazy(() => import("../Module/Auth/ResetPassword"));

// Dashboard
export const Home = lazy(() => import("../Module/Auth/Home"));
export const AddItem = lazy(() => import("../Module/Items/Pages/AddItem"));
export const Size = lazy(() => import("../Module/Items/Pages/Size"));
export const Discounts = lazy(() => import("../Module/Items/Pages/Discounts"));

// Settings
export const CompanySetting = lazy(() =>
  import("../Module/Settings/pages/CompanySetting")
);

// Billing
export const GenerateBills = lazy(() =>
  import("../Module/Billing/Pages/GenerateBill")
);

// Label
export const GenerateLabel = lazy(() =>
  import("../Module/Label/Pages/GenerateLabel")
);
