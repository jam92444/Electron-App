/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPurchaseById, insertPurchaseItem } from "../Services/purchaseService";
import { FaArrowLeft } from "react-icons/fa6";
import { AddItemForm, ViewAllItems } from "../../Items/Routers/items.lazyimports";
import { units } from "../../../Utils/data";
import { updateItem } from "../../Items/Services/items";
import toast from "react-hot-toast";
import Button from "../../../components/ReuseComponents/Button";

const PurchaseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [addNewItem, setAddNewItem] = useState(false);

  // ✅ Extracted: no more duplicated fetch logic
  const refreshPurchase = useCallback(async () => {
    const res = await getPurchaseById(id);
    if (res?.success) setPurchase(res);
  }, [id]);

  useEffect(() => {
    refreshPurchase();
  }, [refreshPurchase]);

  const handleItemAdded = useCallback(async (payload, isEdit) => {
    // ✅ Removed unused `finalPayload`
    const res = isEdit
      ? await updateItem(payload)          // ✅ Fixed double await
      : await insertPurchaseItem(payload);

    if (!res?.success) {
      toast.error(
        res?.error === "ITEM_ID_EXISTS"
          ? "Item ID already exists."
          : `Failed to ${isEdit ? "update" : "add"} item`
      );
      return;
    }

    await refreshPurchase();
    setEditingItem(null);
    setAddNewItem(false);
  }, [id, refreshPurchase]);

  const handleCancelEdit = useCallback(() => {
    setEditingItem(null);
    setAddNewItem(false);
  }, []);

  if (!purchase) return null;

  const isEditing = editingItem !== null; // ✅ Derived, no extra state

  return (
    <div className="p-6 space-y-4 bg-gray-50 min-h-screen">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/purchase")}
      >
        <FaArrowLeft />
        Back
      </div>

      <div className="bg-white p-6 rounded-xl">
        <h2 className="text-lg font-semibold mb-3">Purchase Summary</h2>
        <div className="grid sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Date</p>
            <p>{purchase.purchase.purchaseDate}</p>
          </div>
          <div>
            <p className="text-gray-500">Vendor</p>
            <p>{purchase.purchase.vendorName}</p>
          </div>
          <div>
            <p className="text-gray-500">Remarks</p>
            <p>{purchase.purchase.remarks || "-"}</p>
          </div>
        </div>
      </div>

      {!addNewItem && (
        <div className="flex justify-end">
          <Button
            buttonName="+ New Purchase"
            onClick={() => setAddNewItem(true)}
          />
        </div>
      )}

      <div className={`${addNewItem ? "h-full block" : "h-0 hidden"} transition-all duration-500`}>
        <AddItemForm
          units={units}
          mode="PURCHASE"
          purchaseId={id}
          vendorId={purchase.purchase.vendorId}
          purchaseDate={purchase.purchase.purchaseDate}
          onSave={handleItemAdded}
          initialItem={editingItem}
          onCancel={handleCancelEdit}
          isEdit={isEditing}   // ✅ Derived cleanly
        />
      </div>

      <ViewAllItems items={purchase.items} mode="PURCHASE" readOnly />
    </div>
  );
};

export default PurchaseView;