/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
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
      variants: [...(prev.variants || []), { id: Date.now(), size: "", sellingPrice: "" }],
    }));
  };

  const removeVariant = (index) => {
    setItem((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== index),
    }));
  };

  /* ---------------- SIZE OPTIONS ---------------- */
  const sizeOptions = (sizes || []).map((s) => ({
    value: s.size,
    label: s.size,
  }));

  const vendorOptions = (vendors || []).map((v) => ({
    value: v.id,
    label: v.vendorName,
  }));

  

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    let valid = true;
    const e = { variants: [] };

    if (!item.itemID) (e.itemID = "Item ID required"), (valid = false);
    if (!item.itemName) (e.itemName = "Item name required"), (valid = false);
    if (!item.unit) (e.unit = "Unit required"), (valid = false);
    if (!item.vendorId) (e.vendorId = "Vendor required"), (valid = false);
    if (!item.purchaseDate)
      (e.purchaseDate = "Purchase date required"), (valid = false);

    if (!item.purchaseRate || item.purchaseRate <= 0)
      (e.purchaseRate = "Valid purchase rate required"), (valid = false);

    if (!hasVariants) {
      if (!item.sellingPrice || item.sellingPrice <= 0)
        (e.sellingPrice = "Valid selling price required"), (valid = false);
    }

    if (hasVariants) {
      (item.variants || []).forEach((v, i) => {
        const ve = {};
        if (!v.size) (ve.size = "Size required"), (valid = false);
        if (!v.sellingPrice || v.sellingPrice <= 0)
          (ve.sellingPrice = "Valid selling price required"), (valid = false);
        e.variants[i] = ve;
      });
    }

    setErrors(e);
    return valid;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload = {
      ...item,
      purchaseRate: Number(item.purchaseRate),
      sellingPrice: hasVariants ? null : Number(item.sellingPrice),
      hasVariants,
      variants: hasVariants
        ? (item.variants || []).map((v) => ({ ...v, sellingPrice: Number(v.sellingPrice) }))
        : [],
    };

    onSave(payload, isEdit);

    // Reset form cleanly
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
    <div className="shadow-xl">
      <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-lg border">
        {/* BASIC INFO */}
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
            onChange={(selected) => handleFieldChange("unit", selected?.value || "")}
            options={units}
            placeholder="Select Unit"
            className="mt-4"
            isSearchable
            isClearable
          />
        </div>

        {/* VENDOR + PURCHASE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <Select
            value={vendorOptions.find((v) => v.value === item.vendorId) || null}
            onChange={(selected) => handleFieldChange("vendorId", selected?.value || "")}
            className="mt-4"
            options={vendorOptions}
            placeholder="Select Vendor"
            isSearchable
            isClearable
          />

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
        <div className="mt-4 flex gap-3 items-center">
          <label>Has Variants?</label>
          <input type="checkbox" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} />
        </div>

        {/* VARIANTS */}
        {hasVariants ? (
          <div className="mt-4">
            {(item.variants || []).map((v, i) => (
              <div key={v.id || i} className="grid grid-cols-3 gap-2 mb-3">
                <Select
                  value={sizeOptions.find((opt) => opt.value === v.size) || null}
                  onChange={(selected) => handleVariantChange(i, "size", selected?.value || "")}
                  options={sizeOptions}
                  placeholder="Select Size"
                  className="react-select-container mt-4 rounded-md"
                  classNamePrefix="react-select"
                />
                <Input
                  label="Selling Price"
                  type="number"
                  value={v.sellingPrice}
                  onchange={(e) => handleVariantChange(i, "sellingPrice", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="mt-4 border border-gray-400 rounded-lg w-fit px-2 hover:text-white text-red-400 hover:bg-red-500 transition-all duration-200"
                >
                  <FaTrashCan />
                </button>
              </div>
            ))}

            <Button type="button" buttonName="Add Variant" onClick={addVariant} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <Input
              label="Selling Price"
              type="number"
              value={item.sellingPrice}
              onchange={(e) => handleFieldChange("sellingPrice", e.target.value)}
              error={errors.sellingPrice}
            />
          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-6 flex justify-end gap-3">
          <Button buttonName={isEdit ? "Update" : "Save"} type="submit" />
          {isEdit && <Button buttonName="Cancel" type="button" onClick={onCancel} />}
        </div>
      </form>

      {/* CONFIRM MODAL */}
      {confirm && (
        <Modal
          title="Confirm Save"
          message="Are you sure?"
          onClose={() => setConfirm(false)}
          actions={
            <>
              <Button buttonName="Cancel" onClick={() => setConfirm(false)} />
              <Button buttonName="Confirm" onClick={handleSubmit} />
            </>
          }
        />
      )}
    </div>
  );
};

export default AddItemForm;
