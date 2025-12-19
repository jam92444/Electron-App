import { useState } from "react";
import Button from "../../../components/ReuseComponents/Button";
import VendorBasicDetails from "../Components/VendorBasicDetails";
import VendorBankDetails from "../Components/VendorBankDetails";
import Spinner from "../../../components/ReuseComponents/Spinner";
import Modal from "../../../components/ReuseComponents/Modal";
import { insertVendor } from "../Services/vendors";

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

  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("Confirm Save");
  const [confirmMessage, setConfirmMessage] = useState(
    "Are you sure you want to save this vendor?"
  );
  const [confirmBtnName, setConfirmBtnName] = useState("Save");

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

  // Reset form to initial state
  const resetForm = () => {
    setVendorData({
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
      bankName: "",
      accountHolder: "",
      accountNumber: "",
      ifsc: "",
      upi: "",
      paymentTerms: "30 Days",
      status: "Active",
    });
  };

  // Submit handler -> open confirmation modal
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isFormValid) {
      alert("Please fill all required fields");
      return;
    }

    setConfirmTitle("Confirm Save");
    setConfirmMessage("Are you sure you want to save this vendor?");
    setConfirmBtnName("Save");
    setConfirm(true);
  };

  // Called when user confirms modal
  const handleConfirmSave = async () => {
    setConfirm(false);
    setLoading(true);

    try {
      const response = await insertVendor(vendorData);

      if (response.success) {
        alert("Vendor saved successfully!");
        resetForm();
        // Optionally fetch vendors if you have a list
        // fetchVendors();
      } else {
        if (response.error === "VENDOR_ALREADY_EXISTS") {
          alert("A vendor with this email or phone already exists.");
        } else {
          alert(`Error: ${response.error}`);
        }
      }
    } catch (err) {
      console.error("Error saving vendor:", err);
      alert("An unexpected error occurred while saving the vendor.");
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <Spinner />
  ) : (
    <form onSubmit={handleSubmit} className="bg-white p-4 sm:py-6 sm:px-4">
      <h1 className="text-lg sm:text-xl font-semibold mb-4">Create Vendor</h1>
      <div className="border border-gray-300 shadow-xl rounded-lg p-4">
        <VendorBasicDetails vendorData={vendorData} setVendorData={setVendorData} />
        <VendorBankDetails vendorData={vendorData} setVendorData={setVendorData} />

        <div className="flex justify-end gap-3 my-6 mx-4">
          <Button buttonName="Reset" type="button" onClick={resetForm} />
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

      {confirm && (
        <Modal
          title={confirmTitle}
          message={confirmMessage}
          onClose={() => setConfirm(false)}
          actions={
            <>
              <Button
                buttonName="Cancel"
                buttonType="normal"
                onClick={() => setConfirm(false)}
              />
              <Button
                buttonName={confirmBtnName}
                buttonType="save"
                onClick={handleConfirmSave}
              />
            </>
          }
        />
      )}
    </form>
  );
};

export default Vendor;
