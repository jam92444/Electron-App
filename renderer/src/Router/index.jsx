import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { authRoutes } from "./auth.routes.jsx";
import { appRoutes } from "./app.routes.jsx";
import NotFoundPage from "../pages/NotFound/NotFoundPage";

const router = createBrowserRouter([
  ...authRoutes,
  ...appRoutes,
  { path: "*", element: <NotFoundPage /> },
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
