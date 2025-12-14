import asset from "../../Utils/asset";
import Input from "../../components/ReuseComponents/Input";
import Button from "../../components/ReuseComponents/Button";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();

  const handleLogin = async (credentialResponse) => {
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
            Resetting Password
          </h1>
          <p className="text-lg sm:text-xl font-semibold ">
            You're resetting your password on a secure connection.
          </p>
        </section>

        {/* Logo for Mobile */}
        <div className="w-full mt-10 sm:hidden flex justify-center">
          <img src={asset.logo} className="w-[50%] " alt="Logo" />
         
        </div>

        {/* Form Side */}
        <section className="w-full sm:w-[380px] mx-auto bg-white    text-gray-800  rounded-2xl shadow-2xl p-8 mt-10 sm:mt-0">
          <h2 className="text-xl sm:text-3xl font-extrabold mb-6 text-start ">
            Reset Password
          </h2>

          {/* Form */}
          <form className="flex flex-col gap-4">
            <Input
              type="password"
              placeholder="Create a password"
              label="Password"
              classname="w-full"
            />

            <Input
              type="password"
              placeholder="Confirm password"
              label="Confirm Password"
              classname="w-full"
            />

            <Button
              buttonType="save"
              buttonName="Reset Password"
              classname="w-full font-semibold text-lg p-4"
            />
          </form>
        </section>
      </main>
    </div>
  );
};

export default ResetPassword;
