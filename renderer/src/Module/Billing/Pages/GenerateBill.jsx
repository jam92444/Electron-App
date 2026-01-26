/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from "react";
import { GrPowerReset } from "react-icons/gr";
import Select from "react-select";
import toast from "react-hot-toast";

import {
  deleteBill,
  getBillById,
  saveBill,
  updateBill,
} from "../Services/bills.js";

import Button from "../../../components/ReuseComponents/Button";
import Modal from "../../../components/ReuseComponents/Modal";
import { getCustomers } from "../../Customer/Services/customer.services.js";
import {
  AddBillItemForm,
  Basic44mmTemplate,
  BillItemsTable,
  GenerateFinalAmount,
} from "../Routers/bills.lazyimports.jsx";
import { getCompanyDetails } from "../../Settings/Services/settingService.js";

// -------------------- MAIN COMPONENT --------------------
const GenerateBill = () => {
  const [billItems, setBillItems] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [modal, setModal] = useState(null);
  const [billId, setBillId] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [printBillData, setPrintBillData] = useState({
    invoice_number: null,
    customer_name: null,
    customer_phone: null,
    total_pieces: null,
    total_before_discount: null,
    discount: null,
    discount_amount: null,
    total_after_discount: null,
    payment_mode: null,
  });
  const [billDiscount, setBillDiscount] = useState("");
  const printAfterRef = useRef(false);
  const [billSummary, setBillSummary] = useState({
    customerId: null,
    totalPieces: 0,
    totalBeforeDiscount: 0,
    discount: "",
    discountAmount: 0,
    payment_mode: "Cash",
    totalAfterDiscount: 0,
  });

  /* ================= FETCH CUSTOMERS ================= */
  const fetchCustomers = async () => {
    const res = await getCustomers();
    if (res?.success) setCustomers(res.data || {});
  };
  /* ================= FETCH COMPANY DETAILS ================= */
  const fetchCompanyDetails = async () => {
    const res = await getCompanyDetails();
    if (res?.success) setCompanyDetails(res.data || {});
  };

  useEffect(() => {
    fetchCustomers();
    fetchCompanyDetails();
  }, []);

  useEffect(() => {
    if (printBillData?.invoice_number && printAfterRef.current) {
      window.print();
      printAfterRef.current = false;
    }
  }, [printBillData]);

  /* ================= AUTO APPLY CUSTOMER DISCOUNT ================= */
  useEffect(() => {
    if (selectedCustomer) {
      if (selectedCustomer.discountPercentage > 0) {
        setBillDiscount(Number(selectedCustomer.discountPercentage));
      }
    }

    setBillSummary((prev) => ({
      ...prev,
      customerId: selectedCustomer?.id || null,
    }));
  }, [selectedCustomer]);

  /* ================= AUTO CALCULATIONS ================= */
  useEffect(() => {
    const totalPieces = billItems.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0,
    );

    const totalBeforeDiscount = billItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    );
    const discountAmount =
      totalBeforeDiscount * ((Number(billDiscount) || 0) / 100);
    const totalAfterDiscount = totalBeforeDiscount - discountAmount;

    setBillSummary((prev) => ({
      ...prev,
      totalPieces,
      totalBeforeDiscount,
      discount: billDiscount,
      discountAmount,
      totalAfterDiscount,
    }));
  }, [billItems, billDiscount]);

  /* ================= ROUND OFF ================= */
  const handleRoundOff = () => {
    if ((billSummary?.totalAfterDiscount || 0) <= 0) return;

    const rounded = Math.floor(billSummary.totalAfterDiscount / 10) * 10;
    const newDiscountAmount = billSummary.totalBeforeDiscount - rounded;

    setBillDiscount(
      (newDiscountAmount / billSummary.totalBeforeDiscount) * 100,
    );

    setBillSummary((prev) => ({
      ...prev,
      totalAfterDiscount: rounded,
      discountAmount: newDiscountAmount > 0 ? newDiscountAmount : 0,
    }));
  };

  /* ================= RESET ================= */
  const handleResetForm = () => {
    setBillItems([]);
    setEditIndex(null);
    setBillId(null);
    setSelectedCustomer(null);

    setBillDiscount(""); // ✅
    setBillSummary({
      customerId: null,
      totalPieces: 0,
      totalBeforeDiscount: 0,
      discount: "", // ✅
      discountAmount: 0,
      payment_mode: "Cash",
      totalAfterDiscount: 0,
    });
  };

  /* ================= ADD / UPDATE ITEM ================= */
  const handleSaveItem = (item) => {
    if (!item.itemName || !item.price || !item.quantity) {
      setModal({
        title: "Missing",
        message: "Please fill all required fields (*)",
      });
      return;
    }

    const updated = [...billItems];
    item.totalAmount = Number(item.price) * Number(item.quantity);

    if (editIndex !== null) updated[editIndex] = item;
    else updated.push(item);

    setBillItems(updated);
    setEditIndex(null);
  };

  /* ================= GET BILL DATA AFTER CLICK PRINT /SAVE ================= */
  const handleGetSavedBillData = async (billId) => {
    try {
      const res = await getBillById(billId);
      if (!res.success) return false;
      return res;
    } catch (error) {
      toast.error("Something went wrong", error);
    }
  };
  // Save Bill
  const handleSaveBill = async (printAfter = false) => {
    if (!billItems.length) {
      toast.error("No items to save");
      return;
    }

    try {
      let res;
      if (!billId) {
        res = await saveBill(billSummary, billItems);
        if (!res?.success) return toast.error("Failed to save bill");

        const data = await handleGetSavedBillData(res.billId);
        if (!data?.success)
          return toast.error("Saved bill not found. Please regenerate.");

        setBillId(res.billId);
        setPrintBillData(data.bill);

        if (printAfter) {
          printAfterRef.current = true; // trigger useEffect to print
        }
      } else {
        res = await updateBill(billId, billSummary, billItems);
        if (!res?.success) return toast.error("Failed to update bill");

        if (printAfter) {
          printAfterRef.current = true; // trigger useEffect to print
        }
      }

      if (!printAfter) {
        toast.success("Bill saved successfully");
        handleResetForm();
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  /* ================= EDIT / DELETE ITEM ================= */
  const handleEdit = (index) => setEditIndex(index);

  const handleDelete = (index) => {
    setBillItems(billItems.filter((_, i) => i !== index));
    setModal(null);
  };

  const confirmDelete = (index) => {
    setModal({
      title: "Confirm Delete",
      message: "Remove this item from bill?",
      actions: (
        <>
          <Button
            buttonName="Delete"
            buttonType="delete"
            onClick={() => handleDelete(index)}
          />
          <Button buttonName="Cancel" onClick={() => setModal(null)} />
        </>
      ),
    });
  };

  /* ================= DELETE BILL ================= */
  const handleDeleteBill = async () => {
    if (!billId) return toast.error("No bill to delete");

    setModal({
      title: "Confirm Delete",
      message: "This bill will be permanently deleted",
      actions: (
        <>
          <Button
            buttonName="Delete"
            buttonType="delete"
            onClick={async () => {
              const res = await deleteBill(billId);
              if (res.success) {
                toast.success("Bill deleted");
                handleResetForm();
                setModal(null);
              } else toast.error("Delete failed");
            }}
          />
          <Button buttonName="Cancel" onClick={() => setModal(null)} />
        </>
      ),
    });
  };

  /* ================= RENDER ================= */
  return (
    <div className="bg-gray-50 min-h-screen p-3 sm:p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Generate Sales Bill
          </h1>
          <p className="text-sm text-gray-600 italic">
            Quickly generate and track invoices for your customers.
          </p>
        </div>
        <button
          onClick={handleResetForm}
          className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white shadow-sm"
        >
          <GrPowerReset />
          <span className="text-sm">Reset</span>
        </button>
      </div>

      {/* CUSTOMER */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-4">
        <label className="text-sm font-medium block mb-1">
          Customer (Optional)
        </label>
        <Select
          options={customers.map((c) => ({
            label: `${c.name} (${c.phone})`,
            value: c.id,
          }))}
          value={
            selectedCustomer
              ? {
                  label: `${selectedCustomer.name} (${selectedCustomer.phone})`,
                  value: selectedCustomer.id,
                }
              : null
          }
          isClearable
          onChange={(selected) => {
            if (!selected) return setSelectedCustomer(null);
            const customer = customers.find((c) => c.id === selected.value);
            setSelectedCustomer(customer);
          }}
          placeholder="Select customer"
          className="max-w-sm"
        />
        <span className="text-xs text-green-600">
          Customer discount applied automatically
        </span>
      </div>

      {/* ITEMS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <AddBillItemForm
              initialItem={editIndex !== null ? billItems[editIndex] : null}
              onSave={handleSaveItem}
              onCancel={() => setEditIndex(null)}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <BillItemsTable
              items={billItems}
              onEdit={handleEdit}
              onDelete={confirmDelete}
            />
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <GenerateFinalAmount
        billSummary={billSummary}
        setBillDiscount={setBillDiscount}
        setBillSummary={setBillSummary}
        onPrint={() => handleSaveBill(true)}
        onSaveOnly={() => handleSaveBill(false)}
        onRoundOff={handleRoundOff}
        onDeleteBill={handleDeleteBill}
      />

      <Basic44mmTemplate
        billItems={billItems}
        billSummary={printBillData}
        companyDetails={companyDetails}
      />

      {modal && <Modal {...modal} onClose={() => setModal(null)} />}
    </div>
  );
};

export default GenerateBill;
