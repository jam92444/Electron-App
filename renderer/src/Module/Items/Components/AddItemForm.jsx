/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
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

  const [item, setItem] = useState({
    itemID: "",
    itemName: "",
    unit: "",
    vendorId: vendorId || "",
    purchaseDate: purchaseDate || "",
    purchaseRate: "",
    sellingPrice: "",
    variants: [],
  });

  useEffect(() => {
    getSizes().then((res) => res?.success && setSizes(res.sizes || []));
    getVendors().then((res) => res?.success && setVendors(res.data || []));
  }, []);

  // Set purchaseId, vendorId, purchaseDate when adding new item
  useEffect(() => {
    if (!initialItem && mode === "PURCHASE") {
      setItem((prev) => ({
        ...prev,
        vendorId: vendorId || "",
        purchaseDate: purchaseDate || "",
      }));
    }
  }, [initialItem, vendorId, purchaseDate, mode]);

  const handleFieldChange = (field, value) => {
    setItem((prev) => ({ ...prev, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...(item.variants || [])];
    updated[index][field] = value;
    setItem((prev) => ({ ...prev, variants: updated }));
  };

  const addVariant = () => {
    setItem((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        { id: Date.now(), size: "", sellingPrice: "" },
      ],
    }));
  };

  const removeVariant = (index) => {
    setItem((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== index),
    }));
  };

  const sizeOptions = (sizes || []).map((s) => ({
    value: s.size,
    label: s.size,
  }));
  const vendorOptions = (vendors || []).map((v) => ({
    value: v.id,
    label: v.vendorName,
  }));

  const validateForm = () => {
    let valid = true;
    const e = { variants: [] };

    if (!item.itemID) {
      e.itemID = "Item ID required";
      valid = false;
      setConfirm(false);
    }
    if (!item.itemName) {
      e.itemName = "Item name required";
      valid = false;
      setConfirm(false);
    }
    if (!item.unit) {
      e.unit = "Unit required";
      valid = false;
      setConfirm(false);
    }
    if (!item.purchaseDate && mode === "MASTER") {
      e.purchaseDate = "Purchase date required";
      valid = false;
      setConfirm(false);
    }
    if (!item.purchaseRate || item.purchaseRate <= 0) {
      e.purchaseRate = "Valid purchase rate required";
      valid = false;
      setConfirm(false);
    }

    if (!hasVariants) {
      if (!item.sellingPrice || item.sellingPrice <= 0) {
        e.sellingPrice = "Valid selling price required";
        valid = false;
        setConfirm(false);
      }
    } else {
      (item.variants || []).forEach((v, i) => {
        const ve = {};
        if (!v.size) {
          ve.size = "Size required";
          valid = false;
          setConfirm(false);
        }
        if (!v.sellingPrice || v.sellingPrice <= 0) {
          ve.sellingPrice = "Valid selling price required";
          valid = false;
          setConfirm(false);
        }
        e.variants[i] = ve;
      });
    }

    setErrors(e);
    return valid;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload = {
      ...item,
      vendorId,
      purchaseId: mode === "PURCHASE" ? purchaseId : null,
      purchaseRate: Number(item.purchaseRate),
      sellingPrice: hasVariants ? null : Number(item.sellingPrice),
      hasVariants,
      variants: hasVariants
        ? (item.variants || []).map((v) => ({
            ...v,
            sellingPrice: Number(v.sellingPrice),
          }))
        : [],
    };

    onSave(payload, isEdit);

    // Reset form
    setItem({
      itemID: "",
      itemName: "",
      unit: "",
      vendorId: vendorId || "",
      purchaseDate: purchaseDate || "",
      purchaseRate: "",
      sellingPrice: "",
      variants: [],
    });
    setHasVariants(false);
    setErrors({});
    setConfirm(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setConfirm(true);
  };

  return (
    <div className="shadow-lg rounded-xl bg-white p-6 border border-gray-200">
      <form onSubmit={handleFormSubmit}>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Item Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Item ID"
            placeholder="Item ID"
            value={item.itemID}
            disabled={isEdit}
            onchange={(e) => handleFieldChange("itemID", e.target.value)}
            error={errors.itemID}
          />
          <Input
            label="Item Name"
            placeholder="Item Name"
            value={item.itemName}
            onchange={(e) => handleFieldChange("itemName", e.target.value)}
            error={errors.itemName}
          />
          <Select
            value={units.find((u) => u.value === item.unit) || null}
            onChange={(selected) =>
              handleFieldChange("unit", selected?.value || "")
            }
            options={units}
            placeholder="Select Unit"
            className="mt-4"
            isSearchable
            isClearable
          />
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-4">
          Purchase Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Purchase Date"
            type="date"
            value={item.purchaseDate}
            onchange={(e) => handleFieldChange("purchaseDate", e.target.value)}
            disabled
          />
          <Select
            value={
              vendorOptions.find(
                (v) => v.value === (item.vendorId || vendorId),
              ) || null
            }
            options={vendorOptions}
            isDisabled={mode === "PURCHASE"}
            className="mt-4"
            onChange={(selected) =>
              handleFieldChange("vendorId", selected?.value || "")
            }
          />

          <Input
            label="Purchase Rate"
            type="number"
            value={item.purchaseRate}
            onchange={(e) => handleFieldChange("purchaseRate", e.target.value)}
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <input
            type="checkbox"
            checked={hasVariants}
            onChange={(e) => setHasVariants(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300"
          />
          <label className="text-sm font-medium text-gray-700">
            Has Variants?
          </label>
        </div>

        {hasVariants ? (
          <div className="mt-4 space-y-3">
            {(item.variants || []).map((v, i) => (
              <div
                key={v.id || i}
                className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border rounded-lg shadow-sm bg-gray-50"
              >
                <Select
                  value={
                    sizeOptions.find((opt) => opt.value === v.size) || null
                  }
                  onChange={(selected) =>
                    handleVariantChange(i, "size", selected?.value || "")
                  }
                  options={sizeOptions}
                  placeholder="Select Size"
                />
                <Input
                  label="Selling Price"
                  type="number"
                  value={v.sellingPrice}
                  onchange={(e) =>
                    handleVariantChange(i, "sellingPrice", e.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="mt-4 sm:mt-0 flex justify-center items-center border border-red-400 rounded-lg w-fit px-3 py-2 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  <FaTrashCan />
                </button>
              </div>
            ))}
            <Button buttonName="+ Add Variant" onClick={addVariant} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <Input
              label="Selling Price"
              type="number"
              value={item.sellingPrice}
              onchange={(e) =>
                handleFieldChange("sellingPrice", e.target.value)
              }
            />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button
            buttonName="Cancel"
            type="button"
            onClick={() => setConfirm(false)}
          />
          <Button
            buttonName={confirm ? "Confirm & Add" : "Add Item"}
            type="submit"
          />
        </div>
      </form>

      {confirm && (
        <Modal
          title="Confirm Add Item"
          message="Are you sure you want to add this item?"
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
