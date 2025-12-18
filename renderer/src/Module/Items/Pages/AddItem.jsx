import { useEffect, useState } from "react";
import Input from "../../../components/ReuseComponents/Input";
import Button from "../../../components/ReuseComponents/Button";
import { units } from "../../../Utils/data";
import { FaPen, FaTrashCan } from "react-icons/fa6";
import Modal from "../../../components/ReuseComponents/Modal";
import { useNavigate } from "react-router-dom";
import { Table, Tag, Space } from "antd";
import {
  deleteItem,
  getItems,
  insertItem,
  updateItem,
} from "../Services/items";
import { getSizes } from "../Services/sizes";

/* ---------------------------------------------------------
   MAIN COMPONENT
---------------------------------------------------------- */
const AddItem = () => {
  const [items, setItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [errorModal, setErrorModal] = useState({
    open: false,
    title: "",
    message: "",
  });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const res = await getItems();
      if (res.success) {
        setItems(res.items);
      } else {
        console.error(res.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditingItem(items[index]);
  };
  const handleSave = async (item, isEdit) => {
    if (saving) return;
    setSaving(true);
    try {
      let result;
      if (isEdit) result = await updateItem(item);
      else result = await insertItem(item);

      if (!result.success) {
        if (result.error === "ITEM_ID_EXISTS") {
          setErrorModal({
            open: true,
            title: "Item Already Exists",
            message: "Item ID already exists. Please use a different Item ID.",
          });
        } else {
          setErrorModal({
            open: true,
            title: "Error",
            message: result.error,
          });
        }
        return;
      }

      await loadItems();
      setEditingIndex(null);
      setEditingItem(null);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingItem(null);
  };

  return (
    <div className="p-0 sm:p-4 rounded min-h-screen">
      <h1 className="text-lg px-4 sm:p-0 sm:text-xl font-semibold uppercase text-gray-900  sm:mb-4">
        {editingIndex !== null ? "Edit Item" : "Add New Item"}
      </h1>

      <AddItemForm
        initialItem={editingItem}
        items={items}
        onSave={handleSave}
        units={units}
        onCancel={handleCancelEdit}
        disabled={saving}
        isEdit={editingIndex !== null}
      />

      <ViewAllItems items={items} onEdit={handleEdit} reload={loadItems} />
      {errorModal.open && (
        <Modal
          title={errorModal.title}
          message={errorModal.message}
          onClose={() => setErrorModal({ open: false, title: "", message: "" })}
          actions={
            <Button
              buttonName="OK"
              buttonType="save"
              onClick={() =>
                setErrorModal({ open: false, title: "", message: "" })
              }
            />
          }
        />
      )}
    </div>
  );
};

/* ---------------------------------------------------------
   ADD / EDIT FORM
---------------------------------------------------------- */
const AddItemForm = ({
  initialItem,
  onSave,
  onCancel,
  units = [],
  items,
  disabled,
  isEdit,
}) => {
  const navigate = useNavigate();
  const [sizes, setSizes] = useState([]);
  const [confirm, setConfirm] = useState(false);
  const [title, setTitle] = useState("Confirm Save");
  const [confirmBtnName, setConfirmBtnName] = useState("Save");
  const [message, setMessage] = useState(
    "Are you sure you want to save this item?"
  );

  const [hasVariants, setHasVariants] = useState(false);

  const [item, setItem] = useState({
    itemID: "",
    itemName: "",
    unit: "",
    price: "",
    variants: [],
  });

  const [errors, setErrors] = useState({});

  /* ----------------------------
     LOAD FOR EDIT MODE
  ----------------------------- */
  useEffect(() => {
    if (initialItem) {
      setItem({
        itemID: initialItem.itemID || "",
        itemName: initialItem.itemName || "",
        unit: initialItem.unit || "",
        price: initialItem.price || "",
        variants: initialItem.hasVariants ? [...initialItem.variants] : [],
      });

      setHasVariants(!!initialItem.hasVariants);
    } else {
      handleReset(); // new item
    }
  }, [initialItem]);

  /* ----------------------------
     LOAD FOR SIZE DATA
  ----------------------------- */
  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const data = await getSizes(); // e.g., [{id:1, size:'S'}, {id:2, size:'M'}]
        // setSizes(data);
        if (data.success) {
          setSizes(data.sizes);
        }
      } catch (error) {
        console.error("Failed to fetch sizes", error);
      }
    };

    fetchSizes();
  }, []);

  /* ----------------------------
      FIELD HANDLERS
  ----------------------------- */
  const handleFieldChange = (field, value) => {
    setItem((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...item.variants];
    updated[index][field] = value;

    setItem((prev) => ({ ...prev, variants: updated }));

    setErrors((prev) => {
      const e = { ...prev };
      if (e.variants?.[index]) e.variants[index][field] = "";
      return e;
    });
  };

  const addVariant = () => {
    setItem((prev) => ({
      ...prev,
      variants: [...prev.variants, { id: Date.now(), size: "", price: "" }],
    }));
  };

  const removeVariant = (index) => {
    if (item.variants.length <= 1) return; // prevent empty list
    setItem((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  /* ----------------------------
      VALIDATION
  ----------------------------- */
  const validateForm = () => {
    let valid = true;
    const newErrors = {
      itemID: "",
      itemName: "",
      unit: "",
      price: "",
      variants: [],
    };

    // Unique ID check
    if (!isEdit) {
      if (items.some((i) => i.itemID.trim() === item.itemID.trim())) {
        newErrors.itemID = "Item ID already exists.";
        valid = false;
      }
    }

    if (!item.itemID.trim()) {
      newErrors.itemID = "Item ID is required.";
      valid = false;
    }
    if (!item.itemName.trim()) {
      newErrors.itemName = "Item Name is required.";
      valid = false;
    }
    if (!item.unit) {
      newErrors.unit = "Unit is required.";
      valid = false;
    }

    if (hasVariants) {
      if (item.variants.length === 0) {
        valid = false;
        setTitle("Missing Required Data");
        setMessage("At least one variant is required.");
      }

      item.variants.forEach((v, index) => {
        const variantErrors = { size: "", price: "" };
        if (!v.size.trim()) {
          variantErrors.size = "Size is required.";
          valid = false;
        }
        if (!v.price || isNaN(v.price) || Number(v.price) <= 0) {
          variantErrors.price = "Valid price is required.";
          valid = false;
        }
        newErrors.variants[index] = variantErrors;
      });
    } else {
      if (!item.price || isNaN(item.price) || Number(item.price) <= 0) {
        newErrors.price = "Valid price is required.";
        valid = false;
      }
    }

    setErrors(newErrors);

    // If invalid → no modal
    if (!valid) {
      setConfirm(false);
    }

    return valid;
  };

  /* ----------------------------
      SUBMIT HANDLERS
  ----------------------------- */
  const handleSubmit = () => {
    const finalItem = {
      ...item,
      price: hasVariants ? null : Number(item.price),
      variants: hasVariants
        ? item.variants.map((v) => ({ ...v, price: Number(v.price) }))
        : [],
      hasVariants,
    };

    onSave(finalItem, isEdit);
    if (!isEdit) handleReset();
  };

  const handleValid = () => {
    if (!validateForm()) return;

    handleSubmit();
    setConfirm(false);
  };

  const handleReset = () => {
    setItem({
      itemID: "",
      itemName: "",
      unit: "",
      price: "",
      variants: [],
    });
    setErrors({});
    setHasVariants(false); // FIXED: Default = false
  };

  /* ----------------------------
      RENDER
  ----------------------------- */
  return (
    <div className="shadow-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setTitle("Confirm Save");
          setMessage("Are you sure you want to save this item?");
          setConfirmBtnName(isEdit ? "Update" : "Save");
          setConfirm(true);
        }}
        className="bg-white p-4 sm:p-6 rounded-lg sm:shadow-md border border-gray-300"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Item ID"
            placeholder="Enter Item ID"
            type="text"
            value={item.itemID}
            disabled={isEdit} // FIXED
            onchange={(e) => handleFieldChange("itemID", e.target.value)}
            error={errors.itemID}
          />

          <Input
            label="Item Name"
            placeholder="Enter Item Name"
            type="text"
            value={item.itemName}
            onchange={(e) => handleFieldChange("itemName", e.target.value)}
            error={errors.itemName}
          />

          {/* Select Dropdown */}
          <div className="relative mt-1">
            <select
              name="unit"
              value={item.unit}
              onChange={(e) => handleFieldChange("unit", e.target.value)}
              className="w-full mt-3 px-3 py-2 border border-gray-400 rounded-md bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Unit</option>
              {units.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
            {errors.unit && (
              <p className="text-red-500 text-xs mt-1">{errors.unit}</p>
            )}
          </div>
        </div>

        {/* Has Variants */}
        <div className="mt-6 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-800">
            Has Variants?
          </label>
          <input
            type="checkbox"
            checked={hasVariants}
            onChange={(e) => setHasVariants(e.target.checked)}
            className="w-4 h-4"
          />
        </div>

        {/* VARIANTS */}
        {hasVariants ? (
          <div className="mt-6">
            <h2 className="text-md font-semibold text-gray-800 mb-3">
              Item Variants
            </h2>

            {item.variants.map((variant, index) => (
              <div
                key={variant.id}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4"
              >
                {/* Size Dropdown */}
                <div className="relative mt-3">
                  <label className="block text-xs font-medium text-gray-600 bg-white px-1 left-2 absolute -top-1">
                    Size
                  </label>
                  <select
                    className="w-full mt-1 px-3 py-2 border border-gray-400 rounded-md bg-white text-gray-900 text-sm"
                    value={variant.size}
                    onChange={(e) => {
                      const val = e.target.value;
                      // If user selects the "navigate" option
                      if (val === "__navigate__") {
                        // Navigate to Size Master page
                        navigate("/sizemaster");
                        return;
                      }
                      handleVariantChange(index, "size", val);
                    }}
                  >
                    {sizes.length === 0 ? (
                      <option value="__navigate__">
                        No sizes available – Go to Size Master
                      </option>
                    ) : (
                      <>
                        <option value="">Select Size</option>
                        {sizes.map((s) => (
                          <option key={s.id} value={s.size}>
                            {s.size}
                          </option>
                        ))}
                      </>
                    )}
                  </select>

                  {errors.variants?.[index]?.size && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.variants[index].size}
                    </p>
                  )}
                </div>

                {/* Price Input */}
                <Input
                  label="Price"
                  placeholder="Enter Price"
                  type="number"
                  value={variant.price}
                  onchange={(e) =>
                    handleVariantChange(index, "price", e.target.value)
                  }
                  error={errors.variants?.[index]?.price}
                />

                {/* Delete Variant Button */}
                {item.variants.length > 1 && (
                  <Button
                    buttonName="Delete"
                    buttonType="normal"
                    type="button"
                    withIcon
                    icon={<FaTrashCan />}
                    onClick={() => removeVariant(index)}
                    className="mt-4 w-fit bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded flex gap-2 text-xs"
                  />
                )}
              </div>
            ))}

            <Button
              buttonName="Add Variant"
              type="button"
              onClick={addVariant}
            />
          </div>
        ) : (
          /* PRICE */
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Price"
              placeholder="Enter Price"
              type="number"
              value={item.price}
              onchange={(e) => handleFieldChange("price", e.target.value)}
              error={errors.price}
            />
          </div>
        )}

        <div className="mt-6 flex gap-4 justify-end">
          <Button
            buttonName={isEdit ? "Update Item" : "Save Item"}
            buttonType="save"
            disabled={disabled}
            type="submit"
          />

          {isEdit && (
            <Button
              classname="bg-transparent"
              buttonName="Cancel"
              type="button"
              onClick={onCancel}
            />
          )}
        </div>
      </form>

      {confirm && (
        <Modal
          title={title}
          message={message}
          onClose={() => setConfirm(false)}
          actions={
            <>
              <Button
                buttonName="Cancel"
                buttonType="normal"
                onClick={() => setConfirm(false)}
              />
              <Button
                buttonName={confirmBtnName}
                buttonType="save"
                onClick={handleValid}
              />
            </>
          }
        />
      )}
    </div>
  );
};

/* ---------------------------------------------------------
   VIEW ALL ITEMS TABLE
---------------------------------------------------------- */
const ViewAllItems = ({ items, onEdit, reload }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  const handleDelete = async () => {
    const itemID = items[selectedItemIndex].itemID;

    await deleteItem(itemID); // 🔥 DB delete
    await reload(); // 🔄 Refresh list
    setIsModalOpen(false); // ❌ Close modal
    setSelectedItemIndex(null);
  };
  const columns = [
    {
      title: "Item ID",
      dataIndex: "itemID",
      key: "itemID",
    },
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Variants / Price",
      key: "variants",
      render: (_, record) =>
        record.hasVariants ? (
          record.variants.map((v, id) => (
            <Tag color="blue" key={id}>
              {v.size} – ₹{v.price}
            </Tag>
          ))
        ) : (
          <Tag color="green">₹{record.price}</Tag>
        ),
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record, index) => (
        <Space size="middle">
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => onEdit(index)}
          >
            <FaPen />
          </span>

          <span
            className="text-red-500 cursor-pointer"
            onClick={() => {
              setSelectedItemIndex(index);
              setIsModalOpen(true);
            }}
          >
            <FaTrashCan />
          </span>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-3 sm:p-6 rounded-lg shadow-xl sm:border mt-8">
      <h2 className="text-md font-semibold mb-3">All Items</h2>
      <Table
        columns={columns}
        dataSource={items.map((item, i) => ({
          ...item,
          key: item.itemID, // stable key now
        }))}
        pagination={{ pageSize: 10, showSizeChanger: false, responsive: true }}
        bordered
        scroll={{ x: "max-content" }}
      />

      {isModalOpen && (
        <Modal
          title="Confirm Delete"
          message={`Are you sure you want to delete item "${items[selectedItemIndex]?.itemName}"?`}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItemIndex(null);
          }}
          actions={
            <>
              <Button
                buttonName="Cancel"
                buttonType="normal"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedItemIndex(null);
                }}
              />
              <Button
                buttonName="Delete"
                buttonType="save"
                onClick={handleDelete}
              />
            </>
          }
        />
      )}
    </div>
  );
};

export default AddItem;
