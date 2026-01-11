import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../../components/ReuseComponents/Button";
import Modal from "../../../components/ReuseComponents/Modal";
import AddCustomerForm from "../Components/AddCustomerForm";
import ViewAllCustomers from "../Components/ViewAllCustomers";
import { getDiscounts } from "../../Discount/Services/discount.services";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
} from "../Services/customer.services";

/* ---------------------------------------------------------
   MAIN COMPONENT
---------------------------------------------------------- */
const Customer = () => {
  const [customers, setCustomers] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [errorModal, setErrorModal] = useState({
    open: false,
    title: "",
    message: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCustomers();
    loadDiscounts();
  }, []);

  // Load customers
  const loadCustomers = async () => {
    try {
      const res = await getCustomers();
      if (res.success) {
        setCustomers(res.data);
      } else {
        console.error(res.error);
        setCustomers([])
      }
    } catch (err) {
      console.error(err);
    }
  };
  console.log(customers)
  // Load discounts
  const loadDiscounts = async () => {
    try {
      const res = await getDiscounts();
      if (res.discounts) {
        setDiscounts(res.discounts);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle edit button click
  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditingCustomer(customers[index]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle save (create/update)
  const handleSave = async (customerData, isEdit) => {
    if (saving) return;
    setSaving(true);

    try {
      let result;
      if (isEdit) result = await updateCustomer(customerData);
      else result = await createCustomer(customerData);

      if (!result.success) {
        setErrorModal({
          open: true,
          title: "Error",
          message: result.error || "Something went wrong!",
        });
        return;
      }

      toast.success(result?.message || "Customer saved successfully!");
      await loadCustomers();
      setEditingIndex(null);
      setEditingCustomer(null);
    } catch (err) {
      console.error(err);
      setErrorModal({
        open: true,
        title: "Error",
        message: "Something went wrong!",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingCustomer(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* ---------------- PAGE HEADER ---------------- */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Customer Management
        </h1>
        <p className="text-sm text-gray-600">
          Add, edit, and manage customers with applicable discounts
        </p>
      </div>

      {/* ---------------- FORM CARD ---------------- */}
      <div className="bg-white rounded-xl border shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-md font-semibold text-gray-800">
            {editingIndex !== null ? "Edit Customer" : "Add New Customer"}
          </h2>

          {editingIndex !== null && (
            <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
              Editing Mode
            </span>
          )}
        </div>

        <AddCustomerForm
          initialCustomer={editingCustomer}
          discounts={discounts}
          onSave={handleSave}
          onCancel={handleCancelEdit}
          isEdit={editingIndex !== null}
          disabled={saving}
        />
      </div>

      {/* ---------------- TABLE CARD ---------------- */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-md font-semibold text-gray-800 mb-4">
          All Customers
        </h2>

        <ViewAllCustomers
          customers={customers}
          onEdit={handleEdit}
          reload={loadCustomers}
        />
      </div>

      {/* ---------------- ERROR MODAL ---------------- */}
      {errorModal.open && (
        <Modal
          title={errorModal.title}
          message={errorModal.message}
          onClose={() =>
            setErrorModal({ open: false, title: "", message: "" })
          }
          actions={
            <Button
              buttonName="OK"
              buttonType="save"
              onClick={() =>
                setErrorModal({ open: false, title: "", message: "" })
              }
            />
          }
        />
      )}
    </div>
  );
};

export default Customer;
