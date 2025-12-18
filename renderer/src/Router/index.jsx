import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { appRoutes } from "./app.routes.jsx";
import { authRoutes } from "../Module/Auth/Routes/auth.routes.jsx";
import NotFoundPage from "../components/NotFound/NotFoundPage.jsx";

const router = createBrowserRouter([
  ...authRoutes,
  ...appRoutes,
  { path: "*", element: <NotFoundPage /> },
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
