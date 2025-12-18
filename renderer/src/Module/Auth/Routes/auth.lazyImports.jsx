import { lazy } from "react";

// Auth
export const Signup = lazy(() => import("../Pages/Signup"));
export const Login = lazy(() => import("../Pages/Login"));
export const ForgotPassword = lazy(() =>
  import("../Pages/ForgotPassword")
);
export const VerifyEmailMessagePage = lazy(() =>
  import("../Pages/VerifyEmailMessagePage")
);
export const ResetPassword = lazy(() => import("../Pages/ResetPassword"));



