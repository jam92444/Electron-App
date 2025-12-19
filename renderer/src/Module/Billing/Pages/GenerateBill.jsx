import { useState, useEffect } from "react";
import { GrPowerReset } from "react-icons/gr";
import { deleteBill, saveBill, updateBill } from "../Services/bills";
import Button from "../../../components/ReuseComponents/Button";
import AddBillItemForm from "../Components/AddBillItemForm";
import Modal from "../../../components/ReuseComponents/Modal";
import BillItemsTable from "../Components/BillItemsTable";


// ----------- Main Component -----------
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
    paymentmode: "",
    totalAfterDiscount: 0,
  });

  const [billDiscount, setBillDiscount] = useState(0);

  // Update bill summary whenever items or discount change
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

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBillSummary({
      totalPieces,
      totalBeforeDiscount,
      discount: billDiscount,
      discountAmount,
      totalAfterDiscount,
    });
  }, [billItems, billDiscount]);

  // ----------- RoundOFF Amount -----------
  const handleRoundOff = () => {
    if (billSummary.totalAfterDiscount <= 0) return; // prevent 0 or negative

    // Round down to nearest 10
    const rounded = Math.floor(billSummary.totalAfterDiscount / 10) * 10;

    // Calculate new discount amount
    const newDiscountAmount = billSummary.totalBeforeDiscount - rounded;

    // Update discount % based on new discount
    setBillDiscount(
      (newDiscountAmount / billSummary.totalBeforeDiscount) * 100
    );

    // Update billSummary to trigger re-render
    setBillSummary((prev) => ({
      ...prev,
      totalAfterDiscount: rounded,
      discountAmount: newDiscountAmount > 0 ? newDiscountAmount : 0,
    }));
  };

  // ----------- Reset Form -----------
  const handleResetForm = () => {
    setBillItems([]);
    setEditIndex(null);
    setBillId(null);
    setBillSummary({
      totalPieces: 0,
      totalBeforeDiscount: 0,
      discount: 0,
      discountAmount: 0,
      paymentmode: "",
      totalAfterDiscount: 0,
    });
    setBillDiscount(0);
  };
  // ----------- Add/Update Item -----------
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
    if (editIndex !== null) {
      updated[editIndex] = item;
    } else {
      updated.push(item);
    }
    setBillItems(updated);
    setEditIndex(null);
  };

  // ---------------Save Bill to DB---------------
  const handleSaveBill = async (printAfter = false) => {
    if (billItems.length === 0) {
      alert("No items to save!");
      return;
    }

    try {
      let res;

      if (!billId) {
        // FIRST TIME SAVE
        res = await saveBill(billSummary, billItems);

        if (!res.success) {
          alert("Failed to save bill");
          return;
        }

        setBillId(res.billId);
      } else {
        // UPDATE EXISTING BILL
        res = await updateBill(billId, billSummary, billItems);

        if (!res.success) {
          alert("Failed to update bill");
          return;
        }
      }

      if (printAfter) {
        window.print();
      } else {
        alert("Bill saved successfully");
        handleResetForm();
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving bill");
    }
  };

  //--------------- Print Bill and Save---------------
  const handlePrintBill = () => handleSaveBill(true);

  // ---------------Save only---------------
  const handleSaveOnly = () => handleSaveBill(false);

  // ----------- Edit bill items -----------
  const handleEdit = (index) => setEditIndex(index);

  //----------- delete item from bill items -----------
  const handleDelete = (index) => {
    setBillItems(billItems.filter((_, i) => i !== index));
    setModal(null);
  };

  // ----------- delete confirmation -----------
  const confirmDelete = (index) => {
    setModal({
      title: "Alert",
      message: "Are you sure to delete?",
      actions: (
        <>
          <Button
            buttonName={"Delete"}
            buttonType="delete"
            onClick={() => handleDelete(index)}
          />
          <Button buttonName="Close" onClick={() => setModal(null)} />
        </>
      ),
    });
  };

  // ----------- delete Bill -----------
  const handleDeleteBill = async () => {
    if (!billId) {
      alert("No saved bill to delete");
      return;
    }

    setModal({
      title: "Confirm Delete",
      message: "This bill will be permanently deleted. Continue?",
      actions: (
        <>
          <Button
            buttonName="Delete"
            buttonType="delete"
            onClick={async () => {
              const res = await deleteBill(billId);

              if (res.success) {
                setBillItems([]);
                setBillId(null);
                setBillDiscount(0);
                setModal(null);
                alert("Bill deleted successfully");
              } else {
                alert("Failed to delete bill");
              }
            }}
          />
          <Button buttonName="Cancel" onClick={() => setModal(null)} />
        </>
      ),
    });
  };
  console.log(billItems, "billItems");
  return (
    <div className="bg-white p-2 sm:p-6 rounded-lg  min-h-[80vh]">
      <div className="flex items-center gap-4 py-2 justify-between">
        <h1 className="text-xl font-semibold ">Generate Bill</h1>
        <button
          className="mr-2 p-2 border flex items-center  gap-1 mb-2 rounded-lg shadow-md hover:scale-95 hover:shadow-sm transition-all duration-150"
          onClick={() => handleResetForm()}
        >
          <GrPowerReset /> <span>Reset</span>
        </button>
      </div>

      <AddBillItemForm
        initialItem={editIndex !== null ? billItems[editIndex] : null}
        onSave={handleSaveItem}
        onCancel={() => setEditIndex(null)}
      />

      <BillItemsTable
        items={billItems}
        onEdit={handleEdit}
        onDelete={confirmDelete}
        billSummary={billSummary}
        setBillDiscount={setBillDiscount}
        onPrint={handlePrintBill}
        onDeleteBill={handleDeleteBill}
        onSaveOnly={handleSaveOnly}
        onRoundOff={handleRoundOff}
      />

      {/* -------- POS PRINT LAYOUT (Hidden on screen, prints only) ------- */}
      <div id="pos-receipt" className="hidden print:block p-4 text-xs">
        {/* <div className="print:block p-4 text-xs"> */}
        <p className="flex items-start flex-col text-center text-[8px]">
          {" "}
          GST:- 123456789012
        </p>
        <h2 className="text-center font-bold ">ACKIDS WEAR</h2>
        <p className="text-center text-[8px] -mt-2">
          {" "}
          No 6 fathima nagar, 3rd St near saramedu, Coimbatore-641008
        </p>

        <div className="flex justify-between mb-2">
          <span className="text-[8px]">
            Date:
            {new Date().toLocaleString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
          <span className="text-[8px]">
            Time:
            {new Date().toLocaleString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
        <div className="text-nowrap overflow-x-hidden -mb-1">
          ----------------------------------------------------------------------------------------------
        </div>
        <div className="grid grid-cols-4  text-start text-[9px]">
          <span className="w-full text-wrap col-span-2">Item</span>
          <span>Size</span>
          <span>Price</span>
        </div>
        <div className="text-nowrap overflow-x-hidden -mt-1">
          ----------------------------------------------------------------------------------------------
        </div>

        {/* Items */}
        {billItems.map((item, index) => (
          <div key={index} className="grid grid-cols-4  text-start text-[8px]">
            <p className="w-full flex flex-col text-wrap col-span-2">
              <span>
                {item.itemCode} x {item.quantity}
              </span>
              <span className="text-wrap text-[6px] -mt-1">
                ( {item.itemName} )
              </span>
            </p>
            <span className="">{item.size ? item.size : "-"}</span>
            <span className="">₹{Number(item.totalAmount).toFixed(2)}</span>
          </div>
        ))}

        <div className="text-nowrap overflow-x-hidden -mb-1">
          ----------------------------------------------------------------------------------------------
        </div>
        <div className="grid grid-cols-4  text-start text-[9px] font-semibold">
          <span className="w-full text-wrap col-span-2">Total:</span>
          <span className=""></span>
          <span className="">
            ₹{billSummary.totalBeforeDiscount.toFixed(2)}
          </span>
        </div>
        <div className="text-nowrap overflow-x-hidden -mt-1">
          ----------------------------------------------------------------------------------------------
        </div>
        <div className="grid grid-cols-3  text-end text-[8px] mt-3">
          <span className=""></span>
          <span className="w-full text-wrap">Total Pcs:</span>
          <span className="">{billSummary.totalPieces} pcs </span>
        </div>
        <div className="grid grid-cols-3  text-end text-[8px]">
          <span className=""></span>
          <span className="w-full text-wrap">Discount:</span>
          <span className="">₹{billSummary.discountAmount.toFixed(2)} </span>
        </div>
        <div className="grid grid-cols-3  text-end text-[8px] font-semibold">
          <span className="w-full text-wrap "></span>
          <span className="">You save</span>
          <span className="">₹{billSummary.discountAmount.toFixed(2)}</span>
        </div>
        <div className="grid grid-cols-3  text-end text-[8px] font-semibold">
          <span className="w-full text-wrap "></span>
          <span className="">Grand Total:</span>
          <span className="">₹{billSummary.totalAfterDiscount.toFixed(2)}</span>
        </div>
        <p className="text-center text-[7px] mt-2">
          Ph:- 9244437480, 8248114687{" "}
        </p>
        <p className="text-center  text-[7px]">
          Note: Once the product is purchased, it cannot be returned. However,
          it may be exchanged within 24 hours of purchase.
        </p>
        <div className="text-center mt-1 text-[9px]">
          <p>----- Thank you for shopping ! -----</p>
        </div>
      </div>

      {modal && <Modal {...modal} onClose={() => setModal(null)} />}
    </div>
  );
};

export default GenerateBill;
