/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ReuseComponents/Button";
import Input from "../../../components/ReuseComponents/Input";
import Modal from "../../../components/ReuseComponents/Modal";
import Select from "react-select";
import { getSizes } from "../Services/sizes";
import { getVendors } from "../../Vendor/Services/vendors";
import { FaTrashCan } from "react-icons/fa6";

const AddItemForm = ({
  initialItem,
  onSave,
  units = [],
  isEdit = false,
  mode = "MASTER",
  purchaseId = null,
  vendorId = null,
  purchaseDate = null,
}) => {
  const [sizes, setSizes] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [hasVariants, setHasVariants] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const getEmptyItem = () => ({
    itemID: "",
    itemName: "",
    unit: "",
    vendorId: vendorId || "",
    purchaseDate: purchaseDate || "",
    purchaseRate: "",
    sellingPrice: "",
    quantity: 0, // added quantity
    hasVariants: false,
    variants: [],
  });

  const [item, setItem] = useState(getEmptyItem);

  /* ---------------- LOAD MASTER DATA ---------------- */
  useEffect(() => {
    getSizes().then((res) => res?.success && setSizes(res.sizes || []));
    getVendors().then((res) => res?.success && setVendors(res.data || []));
  }, []);

  /* ---------------- HYDRATE EDIT MODE ---------------- */
  useEffect(() => {
    if (initialItem) {
      setItem({
        ...initialItem,
        purchaseRate: initialItem.purchaseRate ?? "",
        sellingPrice: initialItem.sellingPrice ?? "",
        quantity: initialItem.quantity ?? 0,
        variants: initialItem.variants || [],
      });
      setHasVariants(initialItem.hasVariants || false);
    }
  }, [initialItem]);

  /* ---------------- PURCHASE MODE DEFAULTS ---------------- */
  useEffect(() => {
    if (!initialItem && mode === "PURCHASE") {
      setItem((prev) => ({
        ...prev,
        vendorId: vendorId || "",
        purchaseDate: purchaseDate || "",
      }));
    }
  }, [vendorId, purchaseDate, mode, initialItem]);

  /* ---------------- OPTIONS ---------------- */
  const sizeOptions = useMemo(
    () => sizes.map((s) => ({ value: s.size, label: s.size })),
    [sizes],
  );

  const vendorOptions = useMemo(
    () => vendors.map((v) => ({ value: v.id, label: v.vendorName })),
    [vendors],
  );

  /* ---------------- HANDLERS ---------------- */
  const handleFieldChange = (field, value) => {
    setItem((prev) => ({ ...prev, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const handleVariantChange = (index, field, value) => {
    setItem((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v,
      ),
    }));
  };

  const addVariant = () => {
    setItem((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { id: crypto.randomUUID(), size: "", sellingPrice: "", quantity: 0 },
      ],
    }));
  };

  const removeVariant = (index) => {
    setItem((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    const e = { variants: [] };
    let valid = true;

    if (!item.itemID) {
      e.itemID = "Item ID required";
      valid = false;
    }
    if (!item.itemName) {
      e.itemName = "Item name required";
      valid = false;
    }
    if (!item.unit) {
      e.unit = "Unit required";
      valid = false;
    }
    if (!item.purchaseRate || item.purchaseRate <= 0) {
      e.purchaseRate = "Valid purchase rate required";
      valid = false;
    }
    if (!hasVariants) {
      if (!item.sellingPrice || item.sellingPrice <= 0) {
        e.sellingPrice = "Valid selling price required";
        valid = false;
      }
      if (item.quantity < 0) {
        e.quantity = "Quantity cannot be negative";
        valid = false;
      }
    } else {
      item.variants.forEach((v, i) => {
        const ve = {};
        if (!v.size) {
          ve.size = "Size required";
          valid = false;
        }
        if (!v.sellingPrice || v.sellingPrice <= 0) {
          ve.sellingPrice = "Valid selling price required";
          valid = false;
        }
        if (v.quantity < 0) {
          ve.quantity = "Quantity cannot be negative";
          valid = false;
        }
        e.variants[i] = ve;
      });
    }

    setErrors(e);
    return valid;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setConfirm(true);
  };

  const handleSubmit = async () => {
    const payload = {
      ...item,
      vendorId: mode === "PURCHASE" ? vendorId : item.vendorId,
      purchaseId: mode === "PURCHASE" ? purchaseId : null,
      purchaseRate: Number(item.purchaseRate),
      sellingPrice: hasVariants ? null : Number(item.sellingPrice),
      quantity: hasVariants ? null : Number(item.quantity),
      hasVariants,
      variants: hasVariants
        ? item.variants.map((v) => ({
            ...v,
            sellingPrice: Number(v.sellingPrice),
            quantity: Number(v.quantity),
          }))
        : [],
    };

    await onSave(payload, isEdit);
    setItem(getEmptyItem());
    setHasVariants(false);
    setErrors({});
    setConfirm(false);
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="shadow-lg rounded-xl bg-white p-6 border border-gray-200">
      <form onSubmit={handleFormSubmit}>
        <h2 className="text-lg font-semibold mb-4">Item Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Item ID"
            value={item.itemID}
            disabled={isEdit}
            onChange={(e) => handleFieldChange("itemID", e.target.value)}
            error={errors.itemID}
          />
          <Input
            label="Item Name"
            value={item.itemName}
            onChange={(e) => handleFieldChange("itemName", e.target.value)}
            error={errors.itemName}
          />
          <Select
            value={units.find((u) => u.value === item.unit) || null}
            onChange={(s) => handleFieldChange("unit", s?.value || "")}
            options={units}
            className="mt-4"
            placeholder="Select Unit"
            isClearable
          />
        </div>

        <h2 className="text-lg font-semibold mt-6 mb-4">Purchase Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Purchase Date"
            type="date"
            value={item.purchaseDate}
            disabled={mode === "PURCHASE"}
            onChange={(e) => handleFieldChange("purchaseDate", e.target.value)}
          />
          <Select
            value={vendorOptions.find((v) => v.value === item.vendorId) || null}
            options={vendorOptions}
            isDisabled={mode === "PURCHASE"}
            className="mt-4"
            onChange={(s) => handleFieldChange("vendorId", s?.value || "")}
            placeholder="Select Vendor"
          />
          <Input
            label="Purchase Rate"
            type="number"
            value={item.purchaseRate}
            onChange={(e) => handleFieldChange("purchaseRate", e.target.value)}
            error={errors.purchaseRate}
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <input
            type="checkbox"
            checked={hasVariants}
            onChange={(e) => setHasVariants(e.target.checked)}
          />
          <label>Has Variants?</label>
        </div>

        {hasVariants && (
          <div className="mt-4 space-y-3">
            {item.variants.map((v, i) => (
              <div key={v.id} className="grid sm:grid-cols-4 gap-3 p-4 border">
                <Select
                  value={sizeOptions.find((o) => o.value === v.size) || null}
                  options={sizeOptions}
                  placeholder="Select Size"
                  className="mt-4"
                  onChange={(s) =>
                    handleVariantChange(i, "size", s?.value || "")
                  }
                />
                <Input
                  label="Selling Price"
                  type="number"
                  value={v.sellingPrice}
                  onChange={(e) =>
                    handleVariantChange(i, "sellingPrice", e.target.value)
                  }
                  error={errors.variants?.[i]?.sellingPrice}
                />
                <Input
                  label="Quantity"
                  type="number"
                  value={v.quantity}
                  onChange={(e) =>
                    handleVariantChange(i, "quantity", e.target.value)
                  }
                  error={errors.variants?.[i]?.quantity}
                />
                <button
                  type="button"
                  className="bg-red-500 w-fit px-3 mt-4 rounded-full hover:bg-red-300 transition-all "
                  onClick={() => removeVariant(i)}
                >
                  <FaTrashCan />
                </button>
              </div>
            ))}
            <Button
              buttonName="+ Add Variant"
              type="button"
              onClick={addVariant}
            />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {!hasVariants && (
            <Input
              label="Quantity"
              type="number"
              value={item.quantity}
              onChange={(e) => handleFieldChange("quantity", e.target.value)}
              error={errors.quantity}
            />
          )}
          {!hasVariants && (
            <Input
              label="Selling Price"
              type="number"
              value={item.sellingPrice}
              onChange={(e) =>
                handleFieldChange("sellingPrice", e.target.value)
              }
              error={errors.sellingPrice}
              classname="max-w-sm"
            />
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            buttonName="Cancel"
            type="button"
            onClick={() => setItem(getEmptyItem())}
          />
          <Button
            buttonName={isEdit ? "Update Item" : "Add Item"}
            type="submit"
          />
        </div>
      </form>

      {confirm && (
        <Modal
          title={`Confirm ${isEdit ? "Update" : "Add"} Item`}
          message={`Are you sure you want to ${
            isEdit ? "update" : "save"
          } this item?`}
          onClose={() => setConfirm(false)}
          actions={
            <div className="flex justify-end gap-2">
              <Button buttonName="Cancel" onClick={() => setConfirm(false)} />
              <Button buttonName="Confirm" onClick={handleSubmit} />
            </div>
          }
        />
      )}
    </div>
  );
};

export default AddItemForm;
