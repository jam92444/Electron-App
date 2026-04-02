import { useEffect, useState } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import Input from "../../../components/ReuseComponents/Input";
import Button from "../../../components/ReuseComponents/Button";
import { getVendors } from "../../Vendor/Services/vendors";
import {
  createPurchase,
  insertPurchaseItem,
  getPurchaseItems, // ✅ dedicated fetch — add this to your service
} from "../Services/purchaseService";
import { units } from "../../../Utils/data";
import { useNavigate } from "react-router-dom";
import {
  AddItemForm,
  ViewAllItems,
} from "../../Items/Routers/items.lazyimports";
import { updateItem } from "../../Items/Services/items";

const PurchaseCreate = () => {
  const navigate = useNavigate();

  const [purchaseId, setPurchaseId] = useState(null);
  const [purchaseDate, setPurchaseDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [vendor, setVendor] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    getVendors().then((res) => res?.success && setVendors(res.data || []));
  }, []);

  const vendorOptions = vendors.map((v) => ({
    value: v.id,
    label: v.vendorName,
  }));

  console.log("items", items);

  /* ── Validate purchase header ─────────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!purchaseDate) e.purchaseDate = "Purchase date is required";
    if (!vendor) e.vendor = "Please select a vendor";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Step 1: Create purchase header ──────────────────────────────── */
  const handleCreatePurchase = async () => {
    if (!validate()) return;
    setCreating(true);
    try {
      const res = await createPurchase({
        purchaseDate,
        vendorId: vendor.value,
        remarks,
      });
      if (res?.success) {
        setPurchaseId(res.purchaseId);
        toast.success("Purchase created — now add items");
      } else {
        toast.error(res?.error || "Failed to create purchase");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  /* ── Step 2: Insert item + refresh list ──────────────────────────── */
  const handleItemAdded = async (payload, isEdit) => {
    let res;

    if (isEdit) {
      res = await await updateItem(payload); // 🔥 create this API
    } else {
      res = await insertPurchaseItem(payload);
    }

    if (!res?.success) {
      if (res.error == "ITEM_ID_EXISTS") {
        toast.error("Item ID already exist.");
      } else {
        toast.error(`Failed to ${isEdit ? "update" : "add"} item`);
      }
      console.log("error", res);
      return;
    }

    const refresh = await getPurchaseItems(purchaseId);
    if (refresh?.success) setItems(refresh.data);

    // reset edit state
    setEditingItem(null);
    setEditingIndex(null);
  };

  /* ── Done: navigate back ─────────────────────────────────────────── */
  const handleDone = () => navigate("/purchase");

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditingIndex(item.itemID); // or just use editingItem !== null as the flag
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditingIndex(null);
  };

  const isStep2 = !!purchaseId;

  return (
    <div className="p-4 sm:p-6 space-y-5 bg-gray-50 min-h-screen">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">New Purchase</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isStep2
              ? `Purchase created · Add items below`
              : "Fill in the details to create a purchase order"}
          </p>
        </div>
        {/* Step indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium">
          <StepBadge n={1} label="Details" done={isStep2} active={!isStep2} />
          <div className="w-6 h-px bg-gray-300" />
          <StepBadge n={2} label="Items" done={false} active={isStep2} />
        </div>
      </div>

      {/* ── Step 1: Purchase Header ── */}
      <div
        className={`bg-white rounded-xl border p-5 transition-all ${
          isStep2
            ? "border-green-200 bg-green-50/40"
            : "border-gray-200 shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">
            {isStep2 ? "✓ Purchase Details" : "Purchase Details"}
          </h2>
          {/* ✅ Allow editing header after creation */}
          {isStep2 && (
            <button
              onClick={() => setPurchaseId(null)}
              className="text-xs text-blue-500 hover:underline"
            >
              Edit details
            </button>
          )}
        </div>

        {isStep2 ? (
          // Read-only summary once created
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Date
              </p>
              <p className="font-medium text-gray-800 mt-0.5">{purchaseDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Vendor
              </p>
              <p className="font-medium text-gray-800 mt-0.5">
                {vendor?.label}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Remarks
              </p>
              <p className="font-medium text-gray-800 mt-0.5">
                {remarks || "—"}
              </p>
            </div>
          </div>
        ) : (
          // Editable form
          <>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Input
                  type="date"
                  label="Purchase Date *"
                  value={purchaseDate}
                  onChange={(e) => {
                    setPurchaseDate(e.target.value);
                    setErrors((p) => ({ ...p, purchaseDate: null }));
                  }}
                />
                {errors.purchaseDate && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.purchaseDate}
                  </p>
                )}
              </div>

              <div>
                {/* ✅ Vendor select with proper label */}
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Vendor *
                </label>
                <Select
                  options={vendorOptions}
                  value={vendor}
                  onChange={(v) => {
                    setVendor(v);
                    setErrors((p) => ({ ...p, vendor: null }));
                  }}
                  placeholder="Select vendor..."
                  classNamePrefix="react-select"
                />
                {errors.vendor && (
                  <p className="text-xs text-red-500 mt-1">{errors.vendor}</p>
                )}
              </div>

              <Input
                label="Remarks"
                value={remarks}
                placeholder="Optional notes"
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            {/* ✅ Clear visual separation between primary and cancel */}
            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
              <button
                onClick={handleCreatePurchase}
                disabled={creating}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {creating ? "Creating..." : "Save & Continue →"}
              </button>
              <button
                onClick={() => navigate("/purchase")}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Step 2: Add Items ── */}
      {isStep2 && (
        <>
          <AddItemForm
            units={units}
            mode="PURCHASE"
            purchaseId={purchaseId}
            vendorId={vendor?.value}
            purchaseDate={purchaseDate}
            onSave={handleItemAdded}
            initialItem={editingItem}
            onCancel={handleCancelEdit}
            isEdit={editingIndex !== null}
          />
          {/* Items list with count */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Added Items</h3>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>
            <ViewAllItems items={items} mode="PURCHASE" onEdit={handleEdit} />
          </div>

          {/* ✅ Done button with clear intent */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleDone}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              ✓ Done — View All Purchases
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/* ── Step Badge ───────────────────────────────────────────────────────────── */
const StepBadge = ({ n, label, done, active }) => (
  <div
    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
      done
        ? "bg-green-100 text-green-700"
        : active
          ? "bg-orange-100 text-orange-700"
          : "bg-gray-100 text-gray-400"
    }`}
  >
    <span className="w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold bg-current/20">
      {done ? "✓" : n}
    </span>
    {label}
  </div>
);

export default PurchaseCreate;
