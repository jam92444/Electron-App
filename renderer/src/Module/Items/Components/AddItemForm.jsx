/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import Button from "../../../components/ReuseComponents/Button";
import Input from "../../../components/ReuseComponents/Input";
import Modal from "../../../components/ReuseComponents/Modal";
import { getSizes } from "../Services/sizes";
import { FaTrashCan } from "react-icons/fa6";
import { getVendors } from "../../Vendor/Services/vendors";
import Select from "react-select";

const AddItemForm = ({ initialItem, onSave, onCancel, units = [], isEdit }) => {
  const [sizes, setSizes] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [hasVariants, setHasVariants] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const [item, setItem] = useState({
    itemID: "",
    itemName: "",
    unit: "",
    vendorId: "",
    purchaseDate: "",
    purchaseRate: "",
    sellingPrice: "",
    variants: [],
  });

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    getSizes().then((res) => res?.success && setSizes(res.sizes || []));
    getVendors().then((res) => res?.success && setVendors(res.data || []));
  }, []);

  useEffect(() => {
    if (initialItem) {
      setItem({
        ...initialItem,
        purchaseRate: initialItem.purchaseRate || "",
        sellingPrice: initialItem.sellingPrice || "",
        variants: initialItem.variants || [],
      });
      setHasVariants(initialItem.hasVariants || false);
    }
  }, [initialItem]);

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

    if (!item.itemID)
      (e.itemID = "Item ID required"), (valid = false), setConfirm(false);
    if (!item.itemName)
      (e.itemName = "Item name required"), (valid = false), setConfirm(false);
    if (!item.unit)
      (e.unit = "Unit required"), (valid = false), setConfirm(false);
    if (!item.purchaseDate)
      (e.purchaseDate = "Purchase date required"),
        (valid = false),
        setConfirm(false);

    if (!item.purchaseRate || item.purchaseRate <= 0)
      (e.purchaseRate = "Valid purchase rate required"),
        (valid = false),
        setConfirm(false);

    if (!hasVariants) {
      if (!item.sellingPrice || item.sellingPrice <= 0)
        (e.sellingPrice = "Valid selling price required"),
          (valid = false),
          setConfirm(false);
    }

    if (hasVariants) {
      (item.variants || []).forEach((v, i) => {
        const ve = {};
        if (!v.size)
          (ve.size = "Size required"), (valid = false), setConfirm(false);
        if (!v.sellingPrice || v.sellingPrice <= 0)
          (ve.sellingPrice = "Valid selling price required"),
            (valid = false),
            setConfirm(false);
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
      vendorId: item.vendorId ? item.vendorId : null,
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

    setItem({
      itemID: "",
      itemName: "",
      unit: "",
      vendorId: "",
      purchaseDate: "",
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
        {/* BASIC INFO */}
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
          <div className="flex flex-col mt-4">
            {/* <label className="text-sm text-gray-500 mb-1">Unit</label> */}
            <Select
              value={units.find((u) => u.value === item.unit) || null}
              onChange={(selected) =>
                handleFieldChange("unit", selected?.value || "")
              }
              options={units}
              placeholder="Select Unit"
              isSearchable
              isClearable
              className="rounded-md"
            />
            {errors.unit && (
              <p className="text-xs text-red-500 mt-1">{errors.unit}</p>
            )}
          </div>
        </div>

        {/* VENDOR + PURCHASE */}
        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-4">
          Purchase Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col mt-4">
            {/* <label className="text-sm text-gray-500 mb-1">Vendor</label> */}
            <Select
              value={
                vendorOptions.find((v) => v.value === item.vendorId) || null
              }
              onChange={(selected) =>
                handleFieldChange("vendorId", selected?.value || "")
              }
              options={vendorOptions}
              placeholder="Select Vendor"
              isSearchable
              isClearable
              className="rounded-md"
            />
            {errors.vendorId && (
              <p className="text-xs text-red-500 mt-1">{errors.vendorId}</p>
            )}
          </div>
          <Input
            label="Purchase Date"
            type="date"
            value={item.purchaseDate}
            onchange={(e) => handleFieldChange("purchaseDate", e.target.value)}
            error={errors.purchaseDate}
          />
          <Input
            label="Purchase Rate"
            type="number"
            value={item.purchaseRate}
            onchange={(e) => handleFieldChange("purchaseRate", e.target.value)}
            error={errors.purchaseRate}
          />
        </div>

        {/* VARIANT TOGGLE */}
        <div className="mt-6 flex items-center gap-3">
          <input
            type="checkbox"
            checked={hasVariants}
            onChange={(e) => setHasVariants(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label className="text-sm font-medium text-gray-700">
            Has Variants?
          </label>
        </div>

        {/* VARIANTS - MODERN CARD DESIGN */}
        {hasVariants ? (
          <div className="mt-4 space-y-3">
            {(item.variants || []).map((v, i) => (
              <div
                key={v.id || i}
                className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border rounded-lg shadow-sm bg-gray-50 transition hover:shadow-md"
              >
                <div className="flex-1 min-w-[120px] mt-2.5">
                  {/* <label className="text-sm text-gray-500 mb-1 block">Size</label> */}
                  <Select
                    value={
                      sizeOptions.find((opt) => opt.value === v.size) || null
                    }
                    onChange={(selected) =>
                      handleVariantChange(i, "size", selected?.value || "")
                    }
                    options={sizeOptions}
                    placeholder="Select Size"
                    className="rounded-md"
                    classNamePrefix="react-select"
                  />
                  {errors.variants?.[i]?.size && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.variants[i].size}
                    </p>
                  )}
                </div>

                <div className="flex-1 min-w-[120px]">
                  <Input
                    label="Selling Price"
                    type="number"
                    value={v.sellingPrice}
                    onchange={(e) =>
                      handleVariantChange(i, "sellingPrice", e.target.value)
                    }
                    error={errors.variants?.[i]?.sellingPrice}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="mt-4 sm:mt-0 flex justify-center items-center border border-red-400 rounded-lg w-fit px-3 py-2 hover:text-white hover:bg-red-500 text-red-500 transition"
                >
                  <FaTrashCan />
                </button>
              </div>
            ))}
            <Button
              type="button"
              buttonName={
                <p className="border px-2 py-1 rounded text-sm shadow-sm">
                  + Add Variant
                </p>
              }
              onClick={addVariant}
              className="mt-2"
            />
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
              error={errors.sellingPrice}
            />
          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-6 flex justify-end gap-3">
          <Button buttonName={isEdit ? "Update" : "Save"} type="submit" />
          {isEdit && (
            <Button buttonName="Cancel" type="button" onClick={onCancel} />
          )}
        </div>
      </form>

      {/* CONFIRM MODAL */}
      {confirm && (
        <Modal
          title="Confirm Save"
          message="Are you sure you want to save this item?"
          onClose={() => setConfirm(false)}
          actions={
            <div className="flex gap-2 justify-end">
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
