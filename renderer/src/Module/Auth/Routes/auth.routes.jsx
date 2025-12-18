import { withSuspense } from "../../../Router/withSuspense";
import {
  Signup,
  Login,
  ForgotPassword,
  VerifyEmailMessagePage,
  ResetPassword,
} from "./auth.lazyImports";

export const authRoutes = [
  { path: "signup", element: withSuspense(<Signup />) },
  { path: "login", element: withSuspense(<Login />) },
  { path: "forgot-password", element: withSuspense(<ForgotPassword />) },
  { path: "verify-email", element: withSuspense(<VerifyEmailMessagePage />) },
  { path: "reset-password", element: withSuspense(<ResetPassword />) },
];
