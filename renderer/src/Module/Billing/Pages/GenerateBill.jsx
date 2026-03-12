/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef, useCallback } from "react";
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

const GenerateBill = () => {
  const [billItems, setBillItems]           = useState([]);
  const [editIndex, setEditIndex]           = useState(null);
  const [modal, setModal]                   = useState(null);
  const [billId, setBillId]                 = useState(null);
  const [invoiceNumber, setInvoiceNumber]   = useState(null); // show in UI after save
  const [companyDetails, setCompanyDetails] = useState(null);
  const [customers, setCustomers]           = useState([]); // ✅ correct default: []
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [billDiscount, setBillDiscount]     = useState("");
  const [isSaving, setIsSaving]             = useState(false); // ✅ prevent double-save
  const [printBillData, setPrintBillData]   = useState(null);

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

  /* ── Fetch on mount ─────────────────────────────────────────────────── */
  useEffect(() => {
    const init = async () => {
      const [custRes, compRes] = await Promise.all([
        getCustomers(),
        getCompanyDetails(),
      ]);
      if (custRes?.success)  setCustomers(custRes.data  || []); // ✅ always array
      if (compRes?.success)  setCompanyDetails(compRes.data || {});
    };
    init();
  }, []);

  /* ── Print trigger ──────────────────────────────────────────────────── */
  useEffect(() => {
    if (printBillData && printAfterRef.current) {
      // Small delay so the template has time to render with new data
      const t = setTimeout(() => {
        window.print();
        printAfterRef.current = false;
      }, 100);
      return () => clearTimeout(t);
    }
  }, [printBillData]);

  /* ── Customer selected: apply discount + set customerId together ────── */
  // ✅ Combined into one effect — single re-render instead of two
  useEffect(() => {
    if (selectedCustomer) {
      if (selectedCustomer.discountPercentage > 0) {
        setBillDiscount(Number(selectedCustomer.discountPercentage));
      }
      setBillSummary((prev) => ({ ...prev, customerId: selectedCustomer.id }));
    } else {
      setBillSummary((prev) => ({ ...prev, customerId: null }));
    }
  }, [selectedCustomer]);

  /* ── Auto calculations ──────────────────────────────────────────────── */
  useEffect(() => {
    const totalPieces = billItems.reduce(
      (sum, item) => sum + Number(item.quantity || 0), 0,
    );
    const totalBeforeDiscount = billItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0,
    );
    const discountPct    = Number(billDiscount) || 0;
    const discountAmount = totalBeforeDiscount * (discountPct / 100);
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

  /* ── Round off ──────────────────────────────────────────────────────── */
  const handleRoundOff = () => {
    const { totalAfterDiscount, totalBeforeDiscount } = billSummary;

    // ✅ Guard: nothing to round
    if (!totalAfterDiscount || totalAfterDiscount <= 0) return;
    // ✅ Guard: avoid division by zero
    if (!totalBeforeDiscount || totalBeforeDiscount <= 0) return;

    const rounded          = Math.floor(totalAfterDiscount / 10) * 10;
    const newDiscountAmount = totalBeforeDiscount - rounded;
    const newDiscountPct   = (newDiscountAmount / totalBeforeDiscount) * 100;

    setBillDiscount(newDiscountPct);
    setBillSummary((prev) => ({
      ...prev,
      totalAfterDiscount: rounded,
      discountAmount: Math.max(newDiscountAmount, 0),
    }));
  };

  /* ── Reset ──────────────────────────────────────────────────────────── */
  const handleResetForm = useCallback(() => {
    // ✅ Warn if bill has unsaved items
    if (billItems.length > 0 && !billId) {
      setModal({
        title: "Reset Bill?",
        message: "You have unsaved items. Are you sure you want to reset?",
        actions: (
          <>
            <Button
              buttonName="Reset"
              buttonType="delete"
              onClick={() => { doReset(); setModal(null); }}
            />
            <Button buttonName="Cancel" onClick={() => setModal(null)} />
          </>
        ),
      });
      return;
    }
    doReset();
  }, [billItems, billId]);

  const doReset = () => {
    setBillItems([]);
    setEditIndex(null);
    setBillId(null);
    setInvoiceNumber(null);
    setSelectedCustomer(null);
    setBillDiscount("");
    setPrintBillData(null); // ✅ clear stale print data
    setBillSummary({
      customerId: null,
      totalPieces: 0,
      totalBeforeDiscount: 0,
      discount: "",
      discountAmount: 0,
      payment_mode: "Cash",
      totalAfterDiscount: 0,
    });
  };

  /* ── Add / update item ──────────────────────────────────────────────── */
  const handleSaveItem = (item) => {
    if (!item.itemName || !item.price || !item.quantity) {
      setModal({ title: "Missing", message: "Please fill all required fields (*)" });
      return;
    }

    const updated = [...billItems];
    item.totalAmount = Number(item.price) * Number(item.quantity);

    if (editIndex !== null) updated[editIndex] = item;
    else updated.push(item);

    setBillItems(updated);
    setEditIndex(null);
  };

  /* ── Fetch saved bill data ──────────────────────────────────────────── */
  const handleGetSavedBillData = async (id) => {
    try {
      const res = await getBillById(id);
      if (!res.success) return null;
      return res;
    } catch (error) {
      console.error("getBillById error:", error);
      toast.error("Could not fetch saved bill"); // ✅ correct toast usage
      return null;
    }
  };

  /* ── Save / Print ───────────────────────────────────────────────────── */
  const handleSaveBill = async (printAfter = false) => {
    if (!billItems.length)  return toast.error("No items to save");
    if (isSaving)           return; // ✅ block double-click

    setIsSaving(true);
    try {
      let res;

      if (!billId) {
        // New bill
        res = await saveBill(billSummary, billItems);
        if (!res?.success) return toast.error("Failed to save bill");

        const data = await handleGetSavedBillData(res.billId);
        if (!data?.success) return toast.error("Saved bill not found. Please regenerate.");

        setBillId(res.billId);
        setInvoiceNumber(data.bill?.invoice_number || res.billId); // ✅ show in UI
        setPrintBillData(data.bill);

        if (printAfter) printAfterRef.current = true;
      } else {
        // Update existing bill
        res = await updateBill(billId, billSummary, billItems);
        if (!res?.success) return toast.error("Failed to update bill");

        if (printAfter) {
          // ✅ For updates, re-fetch latest data before printing
          const data = await handleGetSavedBillData(billId);
          if (data?.success) setPrintBillData(data.bill);
          printAfterRef.current = true;
        }
      }

      if (!printAfter) {
        toast.success(billId ? "Bill updated successfully" : "Bill saved successfully");
        doReset();
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false); // ✅ always re-enable button
    }
  };

  /* ── Edit / Delete item ─────────────────────────────────────────────── */
  const handleEdit = (index) => setEditIndex(index);

  const handleDelete = (index) => {
    setBillItems((prev) => prev.filter((_, i) => i !== index));
    setModal(null);
  };

  const confirmDelete = (index) => {
    setModal({
      title: "Confirm Delete",
      message: "Remove this item from bill?",
      actions: (
        <>
          <Button buttonName="Delete" buttonType="delete" onClick={() => handleDelete(index)} />
          <Button buttonName="Cancel" onClick={() => setModal(null)} />
        </>
      ),
    });
  };

  /* ── Delete entire bill ─────────────────────────────────────────────── */
  const handleDeleteBill = () => {
    if (!billId) return toast.error("No bill to delete");

    setModal({
      title: "Confirm Delete",
      message: "This bill will be permanently deleted.",
      actions: (
        <>
          <Button
            buttonName="Delete"
            buttonType="delete"
            onClick={async () => {
              const res = await deleteBill(billId);
              if (res?.success) {
                toast.success("Bill deleted");
                doReset();
                setModal(null);
              } else {
                toast.error("Delete failed");
              }
            }}
          />
          <Button buttonName="Cancel" onClick={() => setModal(null)} />
        </>
      ),
    });
  };

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="bg-gray-50 min-h-screen p-3 sm:p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Generate Sales Bill</h1>
          <p className="text-sm text-gray-600 italic">
            Quickly generate and track invoices for your customers.
          </p>
          {/* ✅ Show invoice number once bill is saved */}
          {invoiceNumber && (
            <span className="inline-block mt-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              Invoice #{invoiceNumber} — saved
            </span>
          )}
        </div>
        <button
          onClick={handleResetForm}
          className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors"
        >
          <GrPowerReset />
          <span className="text-sm">Reset</span>
        </button>
      </div>

      {/* CUSTOMER */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-4">
        <label className="text-sm font-medium block mb-1">
          Customer <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <Select
          options={customers.map((c) => ({
            label: `${c.name} (${c.phone})`,
            value: c.id,
          }))}
          value={
            selectedCustomer
              ? { label: `${selectedCustomer.name} (${selectedCustomer.phone})`, value: selectedCustomer.id }
              : null
          }
          isClearable
          onChange={(selected) => {
            if (!selected) return setSelectedCustomer(null);
            const customer = customers.find((c) => c.id === selected.value);
            setSelectedCustomer(customer || null);
          }}
          placeholder="Select customer"
          className="max-w-sm"
        />
        {selectedCustomer?.discountPercentage > 0 && (
          <span className="text-xs text-green-600 mt-1 block">
            ✓ {selectedCustomer.discountPercentage}% customer discount applied
          </span>
        )}
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
        isSaving={isSaving} // ✅ pass down so button can show loading state
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