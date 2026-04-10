import { useEffect, useState } from "react";
import Button from "../../../components/ReuseComponents/Button";
import { units } from "../../../Utils/data";
import Modal from "../../../components/ReuseComponents/Modal";
import { getItems, insertItem, updateItem } from "../Services/items";
import toast from "react-hot-toast";
import { AddItemForm, ViewAllItems } from "../Routers/items.lazyimports";
import { useStateContext } from "../../../context/StateContext";

/* ---------------------------------------------------------
   MAIN COMPONENT
---------------------------------------------------------- */
const AddItem = () => {
  const [items, setItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const { state } = useStateContext();
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
  // console.log("permission", state.user);
  // ✅ Fix 1: handleEdit takes item object now
  const handleEdit = (item) => {
    setEditingItem(item);
    setEditingIndex(item.itemID); // or just use editingItem !== null as the flag
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Fix 2: permission checks corrected
  const handleSave = async (item, isEdit) => {
    if (saving) return false;

    const perms = state.user.permissions;
    const hasPermission = (key) => perms.includes(key) || perms.includes("*.*");

    if (isEdit && !hasPermission("items.update")) {
      toast.error("You don't have permission to update items. Contact Admin.");
      return false;
    }
    if (!isEdit && !hasPermission("items.create")) {
      toast.error("You don't have permission to add new items. Contact Admin.");
      return false;
    }

    setSaving(true);
    try {
      const result = isEdit ? await updateItem(item) : await insertItem(item);

      if (!result.success) {
        setErrorModal({
          open: true,
          title: "Error",
          message:
            result.error === "ITEM_ID_EXISTS"
              ? "Item ID already exists. Please use a different Item ID."
              : result.error || "Something went wrong",
        });
        return false;
      }

      toast.success(isEdit ? "Item updated!" : "Item added!");
      await loadItems();
      setEditingIndex(null);
      setEditingItem(null);
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
      return false;
    } finally {
      setSaving(false);
    }
  };
  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditingIndex(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* ---------------- PAGE HEADER ---------------- */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Item Management</h1>
        <p className="text-sm text-gray-600 italic">
          Add, edit and manage inventory items with pricing, variants &
          quantities
        </p>
      </div>

      {/* ---------------- FORM CARD ---------------- */}
      {state.user.permissions.includes("items.create") ||
        state.user.permissions.includes("items.update") ||
        (state.user.permissions.includes("*.*") && (
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
              onCancel={() => handleCancelEdit()}
              mode="MASTER"
              disabled={saving}
              isEdit={editingIndex !== null}
            />
          </div>
        ))}

      {/* ---------------- TABLE CARD ---------------- */}
      <div>
        <ViewAllItems items={items} onEdit={handleEdit} reload={loadItems} />
      </div>

      {/* ---------------- ERROR MODAL ---------------- */}
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

export default AddItem;
