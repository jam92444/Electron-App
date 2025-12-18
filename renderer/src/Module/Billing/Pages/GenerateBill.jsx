import { useState, useEffect } from "react";
import { discount as discountOptions } from "../../../Utils/data";
import { GrPowerReset } from "react-icons/gr";
import { CiEdit, CiTrash } from "react-icons/ci";
import { getItems } from "../../../services/items";
import { saveBill, updateBill } from "../../../services/bills";
import Select from "react-select"; // searchable select
import Button from "../../../components/ReuseComponents/Button";
import Input from "../../../components/ReuseComponents/Input";
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

// ----------- AddBillItemForm -----------
const AddBillItemForm = ({ initialItem, onSave, onCancel }) => {
  const [item, setItem] = useState({
    itemCode: "",
    itemName: "",
    price: "",
    size: "",
    quantity: "",
    totalAmount: 0,
  });
  const [AllItems, setAllItems] = useState([]);
  useEffect(() => {
    if (initialItem) setItem(initialItem);
  }, [initialItem]);

  useEffect(() => {
    const price = parseFloat(item.price) || 0;
    const qty = parseFloat(item.quantity) || 0;

    setItem((prev) => ({ ...prev, totalAmount: price * qty }));
  }, [item.price, item.quantity]);

  const handleReset = () => {
    setItem({
      itemCode: "",
      itemName: "",
      price: "",
      size: "",
      quantity: "",
      totalAmount: 0,
    });
  };

  useEffect(() => {
    const fetchItems = async () => {
      const response = await getItems();
      if (!response.success) {
        setAllItems([
          {
            itemCode: "No Data found",
            itemName: "",
            price: "",
            size: "",
            quantity: "",
            totalAmount: 0,
          },
        ]);
      } else {
        setAllItems(response.items);
      }
    };
    fetchItems();
  }, []);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(item);
        if (!initialItem) handleReset();
      }}
      className="bg-white p-4 rounded mb-6 shadow-xl border"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Item Name */}
        <div className="mt-4">
          <Select
            options={AllItems.map((i) => ({
              label: i.itemName,
              value: i.itemName,
            }))}
            value={
              item.itemName
                ? { label: item.itemName, value: item.itemName }
                : null
            }
            className="text-sm rounded-full"
            onChange={(selected) => {
              const selectedItem = AllItems.find(
                (i) => i.itemName === selected.value
              );
              setItem({
                ...item,
                itemCode: selectedItem.itemID || "",
                itemName: selectedItem.itemName,
                price: selectedItem.hasVariants ? "" : selectedItem.price,
                size: "",
              });
            }}
            placeholder="Select Item*"
            isSearchable
          />
        </div>

        {/* Item Code */}
        <Input
          label="Item Code"
          placeholder="Enter Item Code"
          value={item.itemCode}
          onChange={(e) => setItem({ ...item, itemCode: e.target.value })}
        />

        {/* Size (Variants) */}
        {item.itemName &&
          AllItems.find((i) => i.itemName === item.itemName)?.hasVariants && (
            <div className="mt-4">
              <Select
                className="text-sm"
                options={AllItems.find(
                  (i) => i.itemName === item.itemName
                ).variants.map((v) => ({ label: v.size, value: v.size }))}
                value={
                  item.size ? { label: item.size, value: item.size } : null
                }
                onChange={(selected) => {
                  const selectedSize = AllItems.find(
                    (i) => i.itemName === item.itemName
                  ).variants.find((v) => v.size === selected.value);
                  setItem({
                    ...item,
                    size: selectedSize.size,
                    price: selectedSize.price,
                  });
                }}
                placeholder="Select Size*"
              />
            </div>
          )}

        {/* Price */}
        <Input
          label="Price *"
          type="number"
          placeholder="Enter Price"
          value={item.price}
          onChange={(e) => setItem({ ...item, price: e.target.value })}
        />

        {/* Quantity */}
        <Input
          label="Quantity *"
          type="number"
          placeholder="Enter Quantity"
          value={item.quantity}
          onChange={(e) => setItem({ ...item, quantity: e.target.value })}
        />

        {/* Total */}
        <Input
          label="Total Amount"
          type="number"
          value={item.totalAmount}
          readOnly
          disabled
        />
      </div>

      <div className="mt-4 flex gap-4 justify-end">
        <Button
          buttonName="Cancel"
          type="button"
          classname="shadow-md hover:scale-95 hover:shadow-sm transition-all duration-150"
          onClick={handleReset}
        />
        <Button
          buttonName={initialItem ? "Update" : "Add Item"}
          buttonType="save"
          classname="shadow-md hover:scale-95 hover:shadow-sm transition-all duration-150"
          type="submit"
        />
        {initialItem && (
          <Button
            buttonName="Cancel"
            buttonType="cancel"
            type="button"
            onClick={onCancel}
          />
        )}
      </div>
    </form>
  );
};

// ----------- BillItemsTable -----------
const BillItemsTable = ({
  items,
  onEdit,
  onDelete,
  billSummary,
  setBillDiscount,
  onPrint,
  onDeleteBill,
  onSaveOnly,
  onRoundOff,
}) => {
  return (
    <div className="bg-white sm:p-4 p-2 rounded shadow-xl border h-auto">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse border border-gray-300 mt-2 rounded-lg shadow-md">
          <thead>
            <tr className="bg-orange-100 text-white text-sm">
              <th className="border p-2">Item Code</th>
              <th className="border p-2">Item Name*</th>
              <th className="border p-2">Price*</th>
              <th className="border p-2">Size*</th>
              <th className="border p-2">Quantity*</th>
              <th className="border p-2">Total Amount</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>

          <tbody className="text-sm text-gray-600">
            {items.length > 0 ? (
              items.map((it, idx) => (
                <tr key={idx}>
                  <td className="border p-2">{it.itemCode}</td>
                  <td className="border p-2">{it.itemName}</td>
                  <td className="border p-2">{it.price}</td>
                  <td className="border p-2">{it.size}</td>
                  <td className="border p-2">{it.quantity}</td>
                  <td className="border p-2">{it.totalAmount}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      className="bg-green-400 rounded-full hover:scale-125 p-1 border"
                      onClick={() => onEdit(idx)}
                    >
                      <CiEdit size={18} color="black" />
                    </button>

                    <button
                      onClick={() => onDelete(idx)}
                      className="bg-red-400 rounded-full hover:scale-125 p-1 border"
                    >
                      <CiTrash color="black" size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="text-center">
                <td className="border px-2 py-1" colSpan={7}>
                  No items added
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <GenerateFinalAmount
        billSummary={billSummary}
        setBillDiscount={setBillDiscount}
        onPrint={onPrint}
        onSaveOnly={onSaveOnly}
        onDeleteBill={onDeleteBill}
        onRoundOff={onRoundOff}
      />
    </div>
  );
};

// ----------- Bill Summary -----------
const GenerateFinalAmount = ({
  billSummary,
  setBillDiscount,
  onPrint,
  onSaveOnly,
  onRoundOff,
  onDeleteBill,
}) => {
  return (
    <div className="mt-10 float-right mr-4 p-4 rounded-lg border shadow-xl bg-white w-full sm:w-[300px] mb-10">
      <h2 className="text-lg font-semibold mb-3">Bill Summary</h2>

      <p className="flex justify-between text-sm mb-1">
        <span>Payment Mode :</span>
        <select className="border px-2 py-1 rounded text-sm">
          <option value="cash">Cash</option>
          <option value="online">Online</option>
        </select>
      </p>

      <div className="flex justify-between text-sm mb-1">
        <span>Discount :</span>
        <select
          className="border px-2 py-1 rounded text-sm"
          value={billSummary.discount}
          onChange={(e) => setBillDiscount(Number(e.target.value))}
        >
          {discountOptions.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <p className="flex justify-between text-sm mb-1">
        <span>No. of PCS :</span>
        <span>{billSummary.totalPieces}</span>
      </p>

      {/* HIDE IF DISCOUNT = 0 */}
      {billSummary.discountAmount > 0 && (
        <p className="flex justify-between text-sm mb-1">
          <span>Amount You Saved :</span>
          <span className="text-green-600 font-semibold">
            ₹{billSummary.discountAmount.toFixed(2)}
          </span>
        </p>
      )}

      <p className="flex justify-between text-sm mt-3 font-semibold">
        <span>Total Amount :</span>
        <span className="text-blue-700">
          ₹{billSummary.totalAfterDiscount.toFixed(2)}
        </span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2  items-center gap-2">
        <Button
          classname="rounded-md shadow-md hover:scale-95 hover:shadow-sm transition-all duration-150"
          buttonName={"Print Bill"}
          buttonType="save"
          onClick={onPrint}
        />
        <Button
          buttonName={"Round off"}
          buttonType="save"
          onClick={onRoundOff}
        />

        <Button
          classname="rounded-md shadow-md hover:scale-95 hover:shadow-sm transition-all duration-150"
          buttonName={"Save Only"}
          buttonType="save"
          onClick={onSaveOnly}
        />
        <Button
          classname="rounded-md shadow-md hover:scale-95 hover:shadow-sm transition-all duration-150"
          buttonName={"Delete Bill"}
          buttonType="delete"
          onClick={onDeleteBill}
        />
      </div>
    </div>
  );
};

export default GenerateBill;
