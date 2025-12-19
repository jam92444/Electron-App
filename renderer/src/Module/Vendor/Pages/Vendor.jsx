import { useState } from "react";
import Button from "../../../components/ReuseComponents/Button";
import VendorBasicDetails from "../Components/VendorBasicDetails";
import VendorBankDetails from "../Components/VendorBankDetails";

const Vendor = () => {
  const [vendorData, setVendorData] = useState({
    // Basic
    vendorName: "",
    contactPerson: "",
    phone: "",
    whatsapp: "",
    email: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    country: "IN",
    gstType: "",
    gstNumber: "",

    // Bank
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    upi: "",
    paymentTerms: "30 Days",
    status: "Active",
  });

  const requiredFields = [
    "vendorName",
    "phone",
    "email",
    "country",
    "state",
    "city",
    "address1",
  ];

  const isFormValid = requiredFields.every((field) => vendorData[field]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const hasErrors = requiredFields.some((field) => !vendorData[field]);

    if (hasErrors) {
      alert("Please fill all required fields");
      return;
    }
    
    console.log("Vendor Data:", vendorData);
    // 🔥 API CALL HERE
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 sm:py-6 sm:px-4  ">
      <h1 className="text-lg sm:text-xl font-semibold mb-4">Create Vendor</h1>
      <div className=" border border-gray-300 shadow-xl rounded-lg p-4">
        <VendorBasicDetails
          vendorData={vendorData}
          setVendorData={setVendorData}
        />

        <VendorBankDetails
          vendorData={vendorData}
          setVendorData={setVendorData}
        />

        <div className="flex justify-end gap-3 my-6 mx-4">
          <Button buttonName="Reset" type="button" />
          <Button
            buttonName="Save Vendor"
            buttonType="save"
            type="submit"
            classname={`${
              !isFormValid
                ? "bg-gray-100 cursor-not-allowed text-gray-500"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            disabled={!isFormValid}
          />
        </div>
      </div>
    </form>
  );
};

export default Vendor;
