import { useEffect, useState } from "react";
import Button from "../../../components/ReuseComponents/Button";
import { units } from "../../../Utils/data";
import Modal from "../../../components/ReuseComponents/Modal";
import { getItems, insertItem, updateItem } from "../Services/items";
import AddItemForm from "../Components/AddItemForm";
import ViewAllItems from "../Components/ViewAllItems";
import toast from "react-hot-toast";

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
    window.scrollTo({ top: 0, behavior: "smooth" });
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

      toast.success(result?.message);
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* ---------------- PAGE HEADER ---------------- */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Item Management
        </h1>
        <p className="text-sm text-gray-600">
          Add, edit and manage inventory items with pricing & variants
        </p>
      </div>

      {/* ---------------- FORM CARD ---------------- */}
      <div className="bg-white rounded-xl border shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-md font-semibold text-gray-800">
            {editingIndex !== null ? "Edit Item" : "Add New Item"}
          </h2>

          {editingIndex !== null && (
            <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
              Editing Mode
            </span>
          )}
        </div>

        <AddItemForm
          initialItem={editingItem}
          items={items}
          onSave={handleSave}
          units={units}
          onCancel={handleCancelEdit}
          disabled={saving}
          isEdit={editingIndex !== null}
        />
      </div>

      {/* ---------------- TABLE CARD ---------------- */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-md font-semibold text-gray-800 mb-4">
          All Items
        </h2>

        <ViewAllItems
          items={items}
          onEdit={handleEdit}
          reload={loadItems}
        />
      </div>

      {/* ---------------- ERROR MODAL ---------------- */}
      {errorModal.open && (
        <Modal
          title={errorModal.title}
          message={errorModal.message}
          onClose={() =>
            setErrorModal({ open: false, title: "", message: "" })
          }
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

export default AddItem;
