import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../../components/ReuseComponents/Button";
import {
  VendorBasicDetails,
  VendorBankDetails,
} from "../Routes/vendor.lazyImports";
import Spinner from "../../../components/ReuseComponents/Spinner";
import Modal from "../../../components/ReuseComponents/Modal";
import { insertVendor, updateVendor } from "../Services/vendors";
import toast from "react-hot-toast";

/* ---------------- INITIAL STATE ---------------- */
const initialVendorState = {
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
};

const Vendor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editingVendor = location.state?.vendor;

  /* ---------------- STATE ---------------- */
  const [vendorData, setVendorData] = useState(
    editingVendor ?? initialVendorState
  );
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmBtnName, setConfirmBtnName] = useState("");

  /* ---------------- VALIDATION ---------------- */
  const requiredFields = [
    "vendorName",
    "phone",
    "country",
    "state",
    "city",
    "address1",
  ];

  const isFormValid = requiredFields.every((field) => vendorData[field]);

  /* ---------------- RESET ---------------- */
  const resetForm = () => {
    setVendorData(initialVendorState);
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Please fill all required fields");
      return;
    }

    setConfirmTitle(editingVendor ? "Confirm Update" : "Confirm Save");
    setConfirmMessage(
      editingVendor
        ? "Are you sure you want to update this vendor?"
        : "Are you sure you want to save this vendor?"
    );
    setConfirmBtnName(editingVendor ? "Update" : "Save");
    setConfirm(true);
  };

  /* ---------------- CONFIRM SAVE ---------------- */
  const handleConfirmSave = async () => {
    setConfirm(false);
    setLoading(true);

    try {
      const response = editingVendor
        ? await updateVendor(vendorData)
        : await insertVendor(vendorData);

      if (response?.success) {
        toast.success(
          editingVendor
            ? "Vendor updated successfully!"
            : "Vendor saved successfully!"
        );

        if (editingVendor) {
          navigate("/vendor/manage-vendor");
        } else {
          resetForm();
        }
      } else {
        toast.error(response?.error ?? "Vendor already exists");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- RENDER ---------------- */
  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* ---------- PAGE HEADER ---------- */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          {editingVendor ? "Edit Vendor" : "Create Vendor"}
        </h1>
        <p className="text-sm text-gray-600">
          Manage vendor details, contact information, and payment settings
        </p>
      </div>

      {/* ---------- FORM CARD ---------- */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border shadow-sm p-6"
      >
        {/* BASIC DETAILS */}
        <div className="mb-6">
          <h2 className="text-md font-semibold text-gray-800 mb-3">
            Vendor Information
          </h2>
          <VendorBasicDetails
            vendorData={vendorData}
            setVendorData={setVendorData}
          />
        </div>

        {/* BANK DETAILS */}
        <div className="mb-6">
          <h2 className="text-md font-semibold text-gray-800 mb-3">
            Bank & Payment Details
          </h2>
          <VendorBankDetails
            vendorData={vendorData}
            setVendorData={setVendorData}
          />
        </div>

        {/* ACTION BAR */}
        <div className="flex justify-end gap-3 border-t pt-4 mt-6">
          <Button
            buttonName="Reset"
            type="button"
            onClick={resetForm}
            disabled={editingVendor}
          />

          <Button
            buttonName={editingVendor ? "Update Vendor" : "Save Vendor"}
            buttonType="save"
            type="submit"
            disabled={!isFormValid}
            classname={`${
              !isFormValid
                ? "bg-gray-200 cursor-not-allowed text-gray-500"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          />
        </div>
      </form>

      {/* ---------- CONFIRM MODAL ---------- */}
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
    </div>
  );
};

export default Vendor;
