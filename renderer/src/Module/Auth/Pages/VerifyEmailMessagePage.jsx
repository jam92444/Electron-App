import Button from "../../../components/ReuseComponents/Button";
import asset from "../../../Utils/asset";
import { useNavigate } from "react-router-dom";
const VerifyEmailMessagePage = () => {
  const navigate = useNavigate();
  const handleGoToMail = () => {
    window.open("https://mail.google.com", "_blank");
  };
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center px-4 text-center  bg-white ">
      <img src={asset.logo} alt="Company Logo" className="w-28 sm:w-36 mb-6" />

      <h1 className="text-2xl sm:text-4xl font-bold mb-3 ">Check Your Inbox</h1>

      <p className="text-gray-600 text-base sm:text-lg max-w-md mb-1 ">
        Thank you for choosing us. We've sent a verification link to your email
        address:
      </p>

      <p className="text-blue-600 font-medium mb-6 break-words cursor-pointer">
        mail@domain.com
      </p>
      <p>
        Back to home <span onClick={() => navigate("/")}>click here</span>
      </p>
      <Button
        buttonName="Open Mailbox"
        classname="px-4 py-1 sm:py-2"
        onClick={handleGoToMail}
      />
    </div>
  );
};

export default VerifyEmailMessagePage;
