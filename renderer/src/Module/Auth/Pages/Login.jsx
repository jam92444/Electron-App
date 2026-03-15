// modules/Auth/Login.jsx
import asset from "../../../Utils/asset";
import Button from "../../../components/ReuseComponents/Button";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../../../context/StateContext";
import { loginUser } from "../Services/auth.services";
import { SET_TOKEN, USER_DATA } from "../../../context/reducer/actionTypes";
import { useEffect, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useStateContext();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (state.user?.id) {
      navigate("/dashboard");
    }
  }, [state.user]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await loginUser({ username, password });

      if (!response.success) {
        localStorage.removeItem("userData");
        setErrorMsg(response.message);
        setUsername("");
        setPassword("");
        return;
      }

      dispatch({ type: USER_DATA, payload: response.user });
      dispatch({ type: SET_TOKEN, payload: "logged-in" });

      localStorage.setItem("userData", JSON.stringify(response.user));

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      localStorage.removeItem("userData");
      setErrorMsg("Login failed. Check console for details.");
    }
  };

  if (state.user?.id) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-white">
      {/* Background Image */}
      <img
        src={asset.bg}
        className="fixed inset-0 w-full h-full object-cover z-0"
        alt="Background"
      />

      {/* Main Content */}
      <main className="relative z-10 flex flex-col lg:flex-row items-center justify-center w-full min-h-screen px-4 sm:px-16">
        {/* Text Side (Hidden on small screens) */}
        <section className="hidden md:flex lg:w-1/2 flex-col justify-start gap-4 -mt-10">
          <img src={asset.logo} className="w-[50%]" alt="Logo" />
          <h1 className="text-3xl sm:text-5xl font-extrabold text-orange-100 mb-2 leading-tight">
            Welcome Back
          </h1>
          <p className="text-lg sm:text-xl font-semibold text-white">
            Log in to manage your invoices quickly and securely.
          </p>
        </section>

        {/* Logo for mobile */}
        <div className="w-full mt-10 sm:hidden flex justify-center">
          <img src={asset.logo} className="w-[50%]" alt="Logo" />
        </div>

        {/* Form Side */}
        <section className="w-full sm:w-[380px] mx-auto bg-white text-gray-800 rounded-2xl shadow-2xl p-8 mt-10 sm:mt-0">
          <h2 className="text-xl sm:text-3xl font-extrabold mb-4 text-start">
            Login
          </h2>
          <p className="mb-4 text-xs text-gray-400">
            "Don't count the days, make the days count." <br /> - Muhammed Ali
          </p>

          <form onSubmit={handleEmailLogin} className="flex flex-col gap-6">
            {/* Username */}
            <div className="relative flex flex-col mt-4">
              <label
                htmlFor="username"
                className="ml-3 sm:ml-4 text-xs bg-white text-gray-500 font-normal px-1 absolute -top-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrorMsg("");
                }}
                className="px-4 py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 border-gray-400 focus:ring-orange-100"
              />
            </div>

            {/* Password */}
            <div className="relative flex flex-col mt-4">
              <label
                htmlFor="password"
                className="ml-3 sm:ml-4 text-xs bg-white text-gray-500 font-normal px-1 absolute -top-2"
              >
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg("");
                }}
                className="px-4 py-2 border rounded-lg text-xs sm:text-sm pr-10 focus:outline-none focus:ring-2 border-gray-400 focus:ring-orange-100"
              />
              <span
                className="absolute right-3 top-[50%] -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </span>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <p className="text-red-500 text-xs text-center -mt-2">
                {errorMsg}
              </p>
            )}

            {/* Login Button */}
            <Button
              buttonType="save"
              buttonName="Login"
              classname="w-full font-semibold text-lg p-4"
            />
          </form>
        </section>
      </main>
    </div>
  );
};

export default Login;
