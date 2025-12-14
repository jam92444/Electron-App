import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Home = () => {
  const navigate = useNavigate();
  const data = [
    {
      label: "SignUp",
      path: "/signup",
    },
    {
      label: "Login",
      path: "/login",
    },
    {
      label: "forgot password",
      path: "/forgot-password",
    },
    {
      label: "reset password",
      path: "/reset-password",
    },
    {
      label: "verify email",
      path: "/verify-email",
    },
  ];
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen  ">
      <h1>Authentication Page</h1>
      {data.map((item, idx) => (
        <div
          className="text-blue-600 underline cursor-pointer"
          key={idx}
          onClick={() => navigate(item.path)}
        >
          GO TO {item.label}
        </div>
      ))}
    </div>
  );
};
export default Home;
