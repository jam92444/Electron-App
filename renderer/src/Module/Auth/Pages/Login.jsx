import asset from "../../../Utils/asset";
import Input from "../../../components/ReuseComponents/Input";
import Button from "../../../components/ReuseComponents/Button";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/google",
        {
          idToken,
        }
      );
      console.log("Logged in:", data);
      // Store token in localStorage or context
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );
      console.log("Email login success:", data);
      // Store token in localStorage or context
    } catch (error) {
      console.error("Email login error:", error);
    }
  };

  return (
    <div className="relative min-h-screen bg-white ">
      {/* Background Image */}
      <img
        src={asset.bg}
        className="fixed inset-0 w-full h-full object-cover z-0 "
        alt="Background"
      />
     

      {/* Main Content */}
      <main className="relative z-10 flex flex-col lg:flex-row items-center justify-center w-full min-h-screen px-4 sm:px-16">
        {/* Text Side (Hidden on small screens) */}
        <section className="hidden md:flex lg:w-1/2 flex-col justify-start gap-4 -mt-10">
          <img src={asset.logo} className="w-[50%] " alt="Logo" />
          
          <h1 className="text-3xl sm:text-5xl font-extrabold text-orange-100 mb-2 leading-tight">
            Welcome Back
          </h1>
          <p className="text-lg sm:text-xl font-semibold ">
            Log in to manage your invoices quickly and securely.
          </p>
        </section>

        {/* Logo for mobile */}
        <div className="w-full mt-10 sm:hidden flex justify-center">
          <img src={asset.logo} className="w-[50%]" alt="Logo" />
        </div>

        {/* Form Side */}
        <section className="w-full sm:w-[380px] mx-auto bg-white   text-gray-800 rounded-2xl shadow-2xl p-8 mt-10 sm:mt-0">
          <h2 className="text-xl sm:text-3xl font-extrabold mb-6 text-start ">
            Login
          </h2>

          {/* Google Login */}
          <div className="w-[100%] flex justify-center mb-4 py-4">
            <div className="relative border border-gray-300 w-full rounded-md">
              <div className="flex items-center justify-center text-sm gap-2 sm:gap-4 font-medium text-gray-700 p-2">
                <img className="w-6" src={asset.googleIcon} alt="" />
                <p className="">Sign Up with Google</p>
              </div>
              <div className="absolute top-0 left-0 opacity-0">
                <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => console.log("Google SignUp Failed")}
                    width="280px"
                    size="large"
                    shape="rectangular"
                  />
                </GoogleOAuthProvider>
              </div>
            </div>
          </div>
          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <span className="absolute bg-white  px-2 text-gray-400 text-sm">
              OR
            </span>
            <hr className="w-full border-t border-gray-300" />
          </div>

          {/* Login Form */}
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
            <Input
              name="email"
              type="email"
              placeholder="Enter your email"
              label="Email"
              classname="w-full"
            />
            <Input
              name="password"
              type="password"
              placeholder="Enter your password"
              label="Password"
              classname="w-full"
            />

            <small
              className="text-end text-blue-600 cursor-pointer hover:underline"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </small>

            <Button
              buttonType="save"
              buttonName="Login"
              classname="w-full font-semibold text-lg p-4"
            />
          </form>

          {/* Link to Signup */}
          <p className="mt-4 text-center text-sm ">
            Don&apos;t have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-blue-600 font-medium hover:underline cursor-pointer"
            >
              Sign Up
            </span>
          </p>
        </section>
      </main>
    </div>
  );
};

export default Login;
