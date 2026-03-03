// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useStateContext } from "../context/StateContext";

const ProtectedRoute = ({ children }) => {
  const { state } = useStateContext();
  const isAuthenticated = !!state.user?.id; // true if user exists

  // console.log(object)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // redirect to login
  }

  return children;
};

export default ProtectedRoute;
