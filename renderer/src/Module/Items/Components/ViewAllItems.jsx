import { Space, Table, Tag } from "antd";
import Button from "../../../components/ReuseComponents/Button";
import Modal from "../../../components/ReuseComponents/Modal";
import { deleteItem } from "../Services/items";
import { useState } from "react";
import { FaPen, FaTrashCan } from "react-icons/fa6";
import { useStateContext } from "../../../context/StateContext";

const ViewAllItems = ({ items = [], onEdit, reload, mode = "MASTER" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // ✅ store record object
  const { state } = useStateContext();
  const perms = state.user.permissions;
  const hasPermission = (key) => perms.includes(key) || perms.includes("*.*");

  const canEdit = hasPermission("items.update");
  const canDelete = hasPermission("items.delete");
  // console.log(canDelete, "delete");
  // console.log(canEdit, "edit");

  const handleDelete = async () => {
    if (!canDelete) {
      alert("You don't have permission to delete items. Contact Admin.");
      return;
    }
    await deleteItem(selectedItem.itemID); // ✅ use record directly
    await reload();
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const columns = [
    {
      title: "Item ID",
      dataIndex: "itemID",
      key: "itemID",
      sorter: (a, b) => a.itemID.localeCompare(b.itemID),
      render: (text) => (
        <span className="font-medium text-gray-700">{text}</span>
      ),
    },
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
      sorter: (a, b) => a.itemName.localeCompare(b.itemName),
      render: (text) => <span className="text-gray-800">{text}</span>,
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      render: (text) => <span className="capitalize">{text}</span>,
    },
    {
      title: "Purchase Price",
      dataIndex: "purchaseRate",
      key: "purchaseRate",
      render: (price) => (
        <span className="text-green-600 font-semibold">₹{price}</span>
      ),
      sorter: (a, b) => a.purchaseRate - b.purchaseRate,
    },
    ...(mode === "MASTER"
      ? [
          {
            title: "Vendor",
            dataIndex: "vendorName",
            key: "vendorName",
            render: (text) => <span className="text-gray-700">{text}</span>,
          },
        ]
      : []),
    {
      title: "Purchase Date",
      dataIndex: "purchaseDate",
      key: "purchaseDate",
      render: (date) => <span className="text-gray-500">{date}</span>,
    },
    {
      title: "Variants / Selling Price",
      key: "variants",
      render: (_, record) =>
        record.hasVariants ? (
          <div className="flex flex-wrap gap-2">
            {(record.variants || []).map((v) => (
              <Tag
                key={v.id}
                color="blue"
                className="px-3 py-1 rounded-lg font-medium shadow-sm"
              >
                Size -{v.size} / ₹{v.sellingPrice} x {v.quantity} {record.unit}
              </Tag>
            ))}
          </div>
        ) : (
          <Tag
            color="green"
            className="px-3 py-1 rounded-lg font-medium shadow-sm"
          >
            ₹{record.sellingPrice} x {record.quantity} {record.unit}
          </Tag>
        ),
    },
    // ✅ Always spread an array — never spread an object or false
    ...(canEdit || canDelete
      ? [
          {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
              <Space size="middle">
                {canEdit && (
                  <button
                    onClick={() => onEdit(record)}
                    title="Edit item"
                    className="cursor-pointer"
                  >
                    <FaPen className="text-blue-800" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => {
                      setSelectedItem(record);
                      setIsModalOpen(true);
                    }}
                    title="Delete item"
                    className="cursor-pointer"
                  >
                    <FaTrashCan className="text-red-800" />
                  </button>
                )}
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={items.map((i) => ({ ...i, key: i.itemID }))} // ✅ use itemID not idx
        pagination={{ pageSize: 10 }}
      />

      {isModalOpen && selectedItem && (
        <Modal
          title="Confirm Delete"
          message={`Are you sure you want to delete "${selectedItem.itemName}"?`} // ✅ use record
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
          }}
          actions={
            <div className="flex justify-end gap-3">
              <Button
                buttonName="Cancel"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedItem(null);
                }}
              />
              <Button
                buttonName="Delete"
                buttonType="delete"
                onClick={handleDelete}
              />
            </div>
          }
        />
      )}
    </div>
  );
};

export default ViewAllItems;
