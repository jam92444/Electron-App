/* eslint-disable react-hooks/set-state-in-effect */
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

  const loadSizes = async () => {
    const res = await getSizes();
    if (!res.success) return alert(res.error || "Failed to load sizes");
    const mapped = res.sizes.map((s) => ({ ...s, sizeName: String(s.size) }));
    setSizes(mapped);
  };

  useEffect(() => {
    loadSizes();
  }, []);

  const validateSize = (sizeObj) => {
    const name = sizeObj.sizeName.trim();
    if (!name) {
      setModal({ title: "Missing", message: "Size is required." });
      return false;
    }

    const duplicate = sizes.some(
      (s, i) =>
        s.sizeName.trim().toLowerCase() === name.toLowerCase() &&
        i !== editIndex,
    );
    if (duplicate) {
      setModal({ title: "Alert", message: "Size already exists." });
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
      const res = await updateSize(sizeToSave.id, Number(sizeToSave.sizeName));
      if (!res.success) return alert(res.message);
    } else {
      const res = await insertSize(Number(sizeToSave.sizeName));
      if (!res.success) return alert(res.message);
    }
    await loadSizes();
    setEditIndex(null);
    setEditSize(null);
    setSizeToSave(null);
    setConfirmSave(false);
  };

  const handleDelete = async () => {
    const size = sizes[confirmDelete];
    const res = await deleteSize(size.id);
    if (!res.success) return alert(res.message);
    await loadSizes();
    setConfirmDelete(null);
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 p-4 sm:p-6">
      {/* ---------- PAGE HEADER ---------- */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Size Management</h1>
        <p className="text-sm text-gray-600 italic">
          Create, update and manage product sizes
        </p>
      </div>

      {/* ---------- FORM CARD ---------- */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-md font-semibold text-gray-800 mb-4">
          {editIndex !== null ? "Edit Size" : "Add New Size"}
        </h2>

        <AddSizeForm
          initialSize={editSize}
          onSave={handleSaveClick}
          onCancel={() => setEditIndex(null)}
        />
      </div>

      {/* ---------- TABLE CARD ---------- */}
      <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
        <h2 className="text-md font-semibold text-gray-800 mb-4">All Sizes</h2>

        <ViewAllSizes
          sizes={sizes}
          onEdit={(i) => {
            setEditIndex(i);
            setEditSize(sizes[i]);
          }}
          onDelete={(i) => setConfirmDelete(i)}
        />
      </div>

      {/* ---------- MODALS ---------- */}
      {confirmSave && (
        <Modal
          title="Confirm Save"
          message={`Are you sure you want to ${
            editIndex !== null ? "update" : "save"
          } this size?`}
          onClose={() => setConfirmSave(false)}
          actions={
            <>
              <Button
                buttonName="Cancel"
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
          title="Confirm Delete"
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
    if (!size.sizeName.trim()) {
      setError("Size is required");
      return;
    }
    setError("");
    onSave(size);
    if (!initialSize) setSize({ sizeName: "" });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-md">
        <Input
          label="Size"
          placeholder="Enter size (eg: 42, XL)"
          value={size.sizeName}
          onChange={(e) => {
            setSize({ sizeName: e.target.value });
            setError("");
          }}
          error={error}
        />
      </div>

      <div className="mt-6 flex gap-3 justify-end">
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
    {
      title: "S.No",
      render: (_, __, index) => index + 1,
      width: 80,
    },
    {
      title: "Size",
      dataIndex: "sizeName",
      key: "sizeName",
    },
    {
      title: "Actions",
      align: "center",
      render: (_, __, index) => (
        <Space>
          <span
            className="text-blue-600 cursor-pointer hover:scale-110 transition"
            onClick={() => onEdit(index)}
          >
            <FaPen />
          </span>
          <span
            className="text-red-500 cursor-pointer hover:scale-110 transition"
            onClick={() => onDelete(index)}
          >
            <FaTrashCan />
          </span>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={sizes.map((s, i) => ({ ...s, key: i }))}
      pagination={{
        pageSizeOptions: ["5", "10", "20", "50"],
        showSizeChanger: true,
      }}
      bordered
      scroll={{ x: "max-content" }}
    />
  );
};
