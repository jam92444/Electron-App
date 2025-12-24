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
  };
  const handleSave = async (item, isEdit) => {
    if (saving) return;
    setSaving(true);
    try {
      let result;
      if (isEdit) result = await updateItem(item);
      else result = await insertItem(item);
      console.log(result, "result item");
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
      } else {
        toast.success(result?.message)
        await loadItems();
        setEditingIndex(null);
        setEditingItem(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingItem(null);
  };

  return (
    <div className="p-0 sm:p-4 rounded min-h-screen ">
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

export default AddItem;
