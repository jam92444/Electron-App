import asset from "../../Utils/asset";
import Input from "../../components/ReuseComponents/Input";
import Button from "../../components/ReuseComponents/Button";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const handleLogin = async (credentialResponse) => {
    try {
      navigate("/team");
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  return (
    <div className="relative min-h-screen bg-white ">
      {/* Background Images */}
      <img
        src={asset.bg}
        className="fixed inset-0 w-full h-full object-cover z-0 "
        alt="Background"
      />
     

      {/* Main Content */}
      <main className="relative z-10 flex flex-col md:flex-row items-center justify-center w-full min-h-screen px-4 sm:px-16">
        {/* Text Side (Hidden on mobile) */}
        <section className="hidden md:flex lg:w-1/2 flex-col justify-start gap-4">
          <img src={asset.logo} className="w-[50%] " alt="Logo" />
       
          <h1 className="text-3xl sm:text-5xl font-extrabold text-orange-100 mb-2 leading-tight">
            Create your account
          </h1>
          <p className="text-lg sm:text-xl font-semibold ">
            Start managing your invoices in minutes.
          </p>
        </section>

        {/* Logo for Mobile */}
        <div className="w-full mb-14 sm:hidden flex justify-center">
          <img src={asset.logo} className="w-[50%] " alt="Logo" />
       
        </div>

        {/* Form Side */}
        <section className="w-full sm:w-[380px] mx-auto bg-white    text-gray-800  rounded-2xl shadow-2xl p-8 -mt-10 sm:mt-0">
          <h2 className="text-xl sm:text-3xl font-extrabold mb-6 text-start ">
            Sign Up
          </h2>

          {/* Google Login */}
          <div className="w-[100%] flex justify-center mb-4 py-4">
            <div className="relative border border-gray-300 -gray-600 w-full rounded-md">
              <div className="flex items-center justify-center text-sm gap-2 sm:gap-4 font-medium text-gray-700  p-2">
                <img className="w-6" src={asset.googleIcon} alt="" />
                <p>Sign Up with Google</p>
              </div>
              <div className="absolute top-0 left-0 opacity-0">
                <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
                  <GoogleLogin
                    onSuccess={handleLogin}
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
            <hr className="w-full border-t border-gray-300 -gray-600" />
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="Enter your email"
              label="Email"
              classname="w-full"
            />
            <Input
              type="text"
              placeholder="Enter your full name"
              label="Full Name"
              classname="w-full"
            />
            <Input
              type="password"
              placeholder="Create a password"
              label="Password"
              classname="w-full"
            />

            <Button
              buttonType="save"
              buttonName="Sign Up"
              classname="w-full font-semibold text-lg p-4"
            />
          </form>

          {/* Link to Login */}
          <p className="mt-4 text-center text-sm ">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-600 font-medium hover:underline cursor-pointer"
            >
              Login
            </span>
          </p>
        </section>
      </main>
    </div>
  );
};

export default Signup;
