import { useEffect, useState } from "react";
import Input from "../../../components/ReuseComponents/Input";
import Button from "../../../components/ReuseComponents/Button";
import Modal from "../../../components/ReuseComponents/Modal";
import { Table, Space } from "antd";
import { FaPen, FaTrashCan } from "react-icons/fa6";
import {
  getSizes,
  insertSize,
  updateSize,
  deleteSize,
} from "../Services/sizes";

// ----------- Main Component -----------
const Size = () => {
  const [sizes, setSizes] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editSize, setEditSize] = useState(null);
  const [modal, setModal] = useState(null);
  const [confirmSave, setConfirmSave] = useState(false);
  const [sizeToSave, setSizeToSave] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Fetch sizes from DB

  const loadSizes = async () => {
    const res = await getSizes(); // res = { success, sizes }
    if (!res.success) return alert(res.error || "Failed to load sizes");

    const mapped = res.sizes.map((s) => ({ ...s, sizeName: String(s.size) }));
    setSizes(mapped);
  };

  useEffect(() => {
    loadSizes();
  }, []);

  // ----------- Validation & Save -----------
  const validateSize = (sizeObj) => {
    const name = sizeObj.sizeName.trim();
    if (!name) {
      setModal({ title: "Missing", message: "Size is required." });
      return false;
    }
    if (name.length < 1) {
      setModal({
        title: "Invalid",
        message: "Size must be at least 1 character.",
      });
      return false;
    }

    const duplicate = sizes.some(
      (s, i) =>
        s.sizeName.trim().toLowerCase() === name.toLowerCase() &&
        i !== editIndex
    );
    if (duplicate) {
      setModal({ title: "Alert", message: "Size Already Exists" });
      return false;
    }
    return true;
  };

  const handleSaveClick = (sizeObj) => {
    if (!validateSize(sizeObj)) return;
    setSizeToSave({ ...sizeObj, sizeName: sizeObj.sizeName.trim() });
    setConfirmSave(true);
  };

  const handleConfirmSave = async () => {
    if (editIndex !== null) {
      // UPDATE
      const res = await updateSize(sizeToSave.id, Number(sizeToSave.sizeName));
      if (!res.success) return alert(res.message);
    } else {
      // INSERT
      const res = await insertSize(Number(sizeToSave.sizeName));
      if (!res.success) return alert(res.message);
    }
    await loadSizes();
    setEditIndex(null);
    setEditSize(null);
    setSizeToSave(null);
    setConfirmSave(false);
  };

  // ----------- Delete -----------
  const handleDelete = async () => {
    const size = sizes[confirmDelete];
    const res = await deleteSize(size.id);
    if (!res.success) return alert(res.message);
    await loadSizes();
    setConfirmDelete(null);
  };

  return (
    <div className="sm:p-4 rounded min-h-[80vh]">
      <h1 className="text-lg sm:text-xl px-4 sm:p-0 font-semibold uppercase text-gray-900 mb-4">
        {editIndex !== null ? "Edit Size" : "Add New Size"}
      </h1>

      <AddSizeForm
        initialSize={editSize}
        onSave={handleSaveClick}
        onCancel={() => setEditIndex(null)}
      />

      <ViewAllSizes
        sizes={sizes}
        onEdit={(i) => {
          setEditIndex(i);
          setEditSize(sizes[i]);
        }}
        onDelete={(i) => setConfirmDelete(i)}
      />

      {confirmSave && (
        <Modal
          title="Confirm Save"
          message={`Are you sure you want to ${
            editIndex !== null ? "Update" : "Save"
          } this size?`}
          onClose={() => setConfirmSave(false)}
          actions={
            <>
              <Button
                buttonName="Cancel"
                buttonType="normal"
                onClick={() => setConfirmSave(false)}
              />
              <Button
                buttonName="Confirm"
                buttonType="save"
                onClick={handleConfirmSave}
              />
            </>
          }
        />
      )}

      {confirmDelete !== null && (
        <Modal
          title="Confirm Deletion"
          message="Are you sure you want to delete this size?"
          onClose={() => setConfirmDelete(null)}
          actions={
            <>
              <Button
                buttonName="Cancel"
                onClick={() => setConfirmDelete(null)}
              />
              <Button
                buttonName="Delete"
                buttonType="delete"
                onClick={handleDelete}
              />
            </>
          }
        />
      )}

      {modal && <Modal {...modal} onClose={() => setModal(null)} />}
    </div>
  );
};

export default Size;

// ----------- AddSizeForm -----------
const AddSizeForm = ({ initialSize, onSave, onCancel }) => {
  const [size, setSize] = useState({ sizeName: "" });
  const [error, setError] = useState("");

  useEffect(() => setSize(initialSize || { sizeName: "" }), [initialSize]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = size.sizeName.trim();
    if (!name) return setError("Size is required.");
    setError("");
    onSave(size);
    if (!initialSize) setSize({ sizeName: "" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-xl sm:border"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input
          label="Size"
          placeholder="Enter Size"
          value={size.sizeName}
          onchange={(e) => {
            setSize({ sizeName: e.target.value });
            setError("");
          }}
          error={error}
        />
      </div>
      <div className="mt-6 flex gap-4 justify-end">
        <Button
          buttonName={initialSize ? "Update Size" : "Save Size"}
          buttonType="save"
          type="submit"
        />
        {initialSize && (
          <Button
            buttonName="Cancel"
            buttonType="cancel"
            type="button"
            onClick={onCancel}
          />
        )}
      </div>
    </form>
  );
};

// ----------- ViewAllSizes -----------
const ViewAllSizes = ({ sizes, onEdit, onDelete }) => {
  const columns = [
    { title: "S No", render: (_, record, index) => <p>{index + 1}</p> },
    { title: "Size Name", dataIndex: "sizeName", key: "sizeName" },
    {
      title: "Actions",
      key: "actions",
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
            onClick={() => onDelete(index)}
          >
            <FaTrashCan />
          </span>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white p-2 sm:p-6 rounded-lg shadow-xl sm:border mt-8">
      <Table
        columns={columns}
        dataSource={sizes.map((s, i) => ({ ...s, key: i }))}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};
