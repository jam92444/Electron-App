/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { GrPowerReset } from "react-icons/gr";
import { deleteBill, saveBill, updateBill } from "../Services/bills.js";
import Button from "../../../components/ReuseComponents/Button";
import AddBillItemForm from "../Components/AddBillItemForm";
import Modal from "../../../components/ReuseComponents/Modal";
import BillItemsTable from "../Components/BillItemsTable";
import toast from "react-hot-toast";
import GenerateFinalAmount from "../Components/GenerateFinalAmount";

// -------------------- MAIN COMPONENT --------------------
const GenerateBill = () => {
  const [billItems, setBillItems] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [modal, setModal] = useState(null);
  const [billId, setBillId] = useState(null);

  const [billSummary, setBillSummary] = useState({
    totalPieces: 0,
    totalBeforeDiscount: 0,
    discount: 0,
    discountAmount: 0,
    payment_mode: "Cash",
    totalAfterDiscount: 0,
  });

  const [billDiscount, setBillDiscount] = useState(0);

  // ---------------- AUTO CALCULATIONS ----------------
  useEffect(() => {
    const totalPieces = billItems.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    const totalBeforeDiscount = billItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );

    const discountAmount = totalBeforeDiscount * (billDiscount / 100);
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

  // ---------------- ROUND OFF ----------------
  const handleRoundOff = () => {
    if ((billSummary?.totalAfterDiscount || 0) <= 0) return;

    const rounded = Math.floor(billSummary.totalAfterDiscount / 10) * 10;
    const newDiscountAmount = (billSummary?.totalBeforeDiscount || 0) - rounded;

    setBillDiscount(
      ((newDiscountAmount || 0) / (billSummary?.totalBeforeDiscount || 1)) * 100
    );

    setBillSummary((prev) => ({
      ...prev,
      totalAfterDiscount: rounded,
      discountAmount: newDiscountAmount > 0 ? newDiscountAmount : 0,
    }));
  };

  // ---------------- RESET ----------------
  const handleResetForm = () => {
    setBillItems([]);
    setEditIndex(null);
    setBillId(null);
    setBillDiscount(0);
    setBillSummary({
      totalPieces: 0,
      totalBeforeDiscount: 0,
      discount: 0,
      discountAmount: 0,
      payment_mode: "Cash",
      totalAfterDiscount: 0,
    });
  };

  // ---------------- ADD / UPDATE ITEM ----------------
  const handleSaveItem = (item) => {
    if (!item.itemName || !item.price || !item.quantity) {
      setModal({
        title: "Missing",
        message: "Please fill all required fields (*)",
      });
      return;
    }

    const updated = [...billItems];
    item.totalAmount =
      parseFloat(item.price) * parseFloat(item.quantity) - (item.discount || 0);

    if (editIndex !== null) updated[editIndex] = item;
    else updated.push(item);

    setBillItems(updated);
    setEditIndex(null);
  };

  // ---------------- SAVE / UPDATE BILL ----------------
  const handleSaveBill = async (printAfter = false) => {
    if (!billItems.length) {
      toast.error("No items to save");
      return;
    }

    try {
      let res;
      if (!billId) {
        res = await saveBill(billSummary, billItems);
        if (!res.success) return toast.error("Failed to save bill");
        setBillId(res.billId);
      } else {
        res = await updateBill(billId, billSummary, billItems);
        if (!res.success) return toast.error("Failed to update bill");
      }

      if (printAfter) {
        window.print();
      } else {
        toast.success("Bill saved successfully");
        handleResetForm();
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const handlePrintBill = () => handleSaveBill(true);
  const handleSaveOnly = () => handleSaveBill(false);

  // ---------------- EDIT / DELETE ITEM ----------------
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

  // ---------------- DELETE BILL ----------------
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

  // ---------------- RENDER ----------------
  return (
    <div className="bg-gray-50 min-h-screen p-3 sm:p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Generate Bill</h1>
        <button
          onClick={handleResetForm}
          className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50"
        >
          <GrPowerReset />
          <span className="text-sm">Reset</span>
        </button>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT SIDE */}
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

          {/* RIGHT SIDE: Bill Summary
          <GenerateFinalAmount
            billSummary={billSummary}
            setBillDiscount={setBillDiscount}
            setBillSummary={setBillSummary}
            onPrint={handlePrintBill}
            onSaveOnly={handleSaveOnly}
            onRoundOff={handleRoundOff}
            onDeleteBill={handleDeleteBill}
          /> */}
      </div>

      {/* POS PRINT TEMPLATE */}
      <div id="pos-receipt" className="hidden print:block">
        <div id="pos-receipt" className="hidden print:block p-4 text-xs">
          {" "}
          {/* <div className="print:block p-4 text-xs"> */}{" "}
          <p className="flex items-start flex-col text-center text-[8px]">
            {" "}
            GST:- 123456789012{" "}
          </p>{" "}
          <h2 className="text-center font-bold ">ACKIDS WEAR</h2>{" "}
          <p className="text-center text-[8px] -mt-2">
            {" "}
            No 6 fathima nagar, 3rd St near saramedu, Coimbatore-641008{" "}
          </p>{" "}
          <div className="flex justify-between mb-2">
            {" "}
            <span className="text-[8px]">
              {" "}
              Date:{" "}
              {new Date().toLocaleString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}{" "}
            </span>{" "}
            <span className="text-[8px]">
              {" "}
              Time:{" "}
              {new Date().toLocaleString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}{" "}
            </span>{" "}
          </div>{" "}
          <div className="text-nowrap overflow-x-hidden -mb-1">
            {" "}
            ----------------------------------------------------------------------------------------------{" "}
          </div>{" "}
          <div className="grid grid-cols-4 text-start text-[9px]">
            {" "}
            <span className="w-full text-wrap col-span-2">Item</span>{" "}
            <span>Size</span> <span>Price</span>{" "}
          </div>{" "}
          <div className="text-nowrap overflow-x-hidden -mt-1">
            {" "}
            ----------------------------------------------------------------------------------------------{" "}
          </div>{" "}
          {/* Items */}{" "}
          {billItems.map((item, index) => (
            <div key={index} className="grid grid-cols-4 text-start text-[8px]">
              {" "}
              <p className="w-full flex flex-col text-wrap col-span-2">
                {" "}
                <span>
                  {" "}
                  {item.itemCode} x {item.quantity}{" "}
                </span>{" "}
                <span className="text-wrap text-[6px] -mt-1">
                  {" "}
                  ( {item.itemName} ){" "}
                </span>{" "}
              </p>{" "}
              <span className="">{item.size ? item.size : "-"}</span>{" "}
              <span className="">₹{Number(item.totalAmount).toFixed(2)}</span>{" "}
            </div>
          ))}{" "}
          <div className="text-nowrap overflow-x-hidden -mb-1">
            {" "}
            ----------------------------------------------------------------------------------------------{" "}
          </div>{" "}
          <div className="grid grid-cols-4 text-start text-[9px] font-semibold">
            {" "}
            <span className="w-full text-wrap col-span-2">Total:</span>{" "}
            <span className=""></span>{" "}
            <span className="">
              {" "}
              ₹{billSummary.totalBeforeDiscount.toFixed(2)}{" "}
            </span>{" "}
          </div>{" "}
          <div className="text-nowrap overflow-x-hidden -mt-1">
            {" "}
            ----------------------------------------------------------------------------------------------{" "}
          </div>{" "}
          <div className="grid grid-cols-3 text-end text-[8px] mt-3">
            {" "}
            <span className=""></span>{" "}
            <span className="w-full text-wrap">Total Pcs:</span>{" "}
            <span className="">{billSummary.totalPieces} pcs </span>{" "}
          </div>{" "}
          {billSummary.discountAmount > 0 &&
            billSummary.discountAmount !== null && (
              <div className="grid grid-cols-3 text-end text-[8px]">
                {" "}
                <span className=""></span>{" "}
                <span className="w-full text-wrap">Discount:</span>{" "}
                <span className="">
                  {" "}
                  ₹{billSummary.discountAmount.toFixed(2)}{" "}
                </span>{" "}
              </div>
            )}{" "}
          {billSummary.discountAmount > 0 &&
            billSummary.discountAmount !== null && (
              <div className="grid grid-cols-3 text-end text-[8px] font-semibold">
                {" "}
                <span className="w-full text-wrap "></span>{" "}
                <span className="">You save</span>{" "}
                <span className="">
                  ₹{billSummary.discountAmount.toFixed(2)}
                </span>{" "}
              </div>
            )}{" "}
          <div className="grid grid-cols-3 text-end text-[8px] font-semibold">
            {" "}
            <span className="w-full text-wrap "></span>{" "}
            <span className="">Grand Total:</span>{" "}
            <span className="">
              ₹{billSummary.totalAfterDiscount.toFixed(2)}
            </span>{" "}
          </div>{" "}
          <p className="text-center text-[7px] mt-2">
            {" "}
            Ph:- 9244437480, 8248114687{" "}
          </p>{" "}
          <p className="text-center text-[7px]"> </p>{" "}
          <div className="text-center mt-1 text-[9px]">
            {" "}
            <p>----- Thank you for shopping ! -----</p>{" "}
          </div>{" "}
        </div>
        
      </div>

      {modal && <Modal {...modal} onClose={() => setModal(null)} />}
    </div>
  );
};

export default GenerateBill;
