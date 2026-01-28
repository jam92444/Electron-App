// renderer/src/modules/Item/Components/ViewAllItems.js

import { Space, Table, Tag } from "antd";
import Button from "../../../components/ReuseComponents/Button";
import Modal from "../../../components/ReuseComponents/Modal";
import { deleteItem } from "../Services/items";
import { useState } from "react";
import { FaPen, FaTrashCan } from "react-icons/fa6";

const ViewAllItems = ({ items = [], onEdit, reload, mode = "MASTER" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  const handleDelete = async () => {
    const itemID = items[selectedItemIndex].itemID;
    await deleteItem(itemID);
    await reload();
    setIsModalOpen(false);
    setSelectedItemIndex(null);
  };

  console.log(items, "items list");

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
                color="blue"
                key={v.id}
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
    {
      title: "Actions",
      key: "actions",
      render: (_, record, index) => (
        <Space size="middle">
          <button onClick={() => onEdit(index)}>
            <FaPen className="text-blue-600 hover:text-blue-800" />
          </button>
          <button
            onClick={() => {
              setSelectedItemIndex(index);
              setIsModalOpen(true);
            }}
          >
            <FaTrashCan className="text-red-600 hover:text-red-800" />
          </button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={items.map((i, idx) => ({ ...i, key: idx }))}
        pagination={{ pageSize: 10 }}
      />

      {isModalOpen && (
        <Modal
          title="Confirm Delete"
          message={`Are you sure you want to delete "${items[selectedItemIndex].itemName}"?`}
          onClose={() => setIsModalOpen(false)}
          actions={
            <div className="flex justify-end gap-3">
              <Button
                buttonName="Cancel"
                onClick={() => setIsModalOpen(false)}
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
