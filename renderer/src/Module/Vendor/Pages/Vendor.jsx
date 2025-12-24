import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../../components/ReuseComponents/Button";
import VendorBasicDetails from "../Components/VendorBasicDetails";
import VendorBankDetails from "../Components/VendorBankDetails";
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

  const isFormValid = requiredFields.every(
    (field) => vendorData[field]
  );

  /* ---------------- RESET FORM ---------------- */
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

        // ✅ UX BEST PRACTICE
        if (editingVendor) {
          navigate("/vendor/manage-vendor"); // redirect after update
        } else {
          resetForm(); // reset only for add
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
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 sm:py-6 sm:px-4"
    >
      <h1 className="text-lg sm:text-xl uppercase font-semibold mb-4">
        {editingVendor ? "Edit Vendor" : "Create Vendor"}
      </h1>

      <div className="border border-gray-300 shadow-xl rounded-lg p-4">
        <VendorBasicDetails
          vendorData={vendorData}
          setVendorData={setVendorData}
        />

        <VendorBankDetails
          vendorData={vendorData}
          setVendorData={setVendorData}
        />

        <div className="flex justify-end gap-3 my-6 mx-4">
          <Button
            buttonName="Reset"
            type="button"
            onClick={resetForm}
            disabled={editingVendor} // optional: disable reset in edit mode
          />

          <Button
            buttonName={editingVendor ? "Update Vendor" : "Save Vendor"}
            buttonType="save"
            type="submit"
            disabled={!isFormValid}
            classname={`${
              !isFormValid
                ? "bg-gray-100 cursor-not-allowed text-gray-500"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
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
