import { Space, Table, Tag } from "antd";
import Button from "../../../components/ReuseComponents/Button";
import Modal from "../../../components/ReuseComponents/Modal";
import { deleteItem } from "../Services/items";
import { useState } from "react";
import { FaPen, FaTrashCan } from "react-icons/fa6";

const ViewAllItems = ({ items, onEdit, reload, mode = "MASTER" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  const handleDelete = async () => {
    const itemID = items[selectedItemIndex].itemID;
    await deleteItem(itemID);
    await reload();
    setIsModalOpen(false);
    setSelectedItemIndex(null);
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
            {record.variants.map((v) => (
              <Tag
                color="blue"
                key={v.id}
                className="px-3 py-1 rounded-lg font-medium shadow-sm"
              >
                {v.size} – ₹{v.sellingPrice}
              </Tag>
            ))}
          </div>
        ) : (
          <Tag
            color="green"
            className="px-3 py-1 rounded-lg font-medium shadow-sm"
          >
            ₹{record.sellingPrice}
          </Tag>
        ),
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record, index) => (
        <Space size="middle">
          <span
            className="text-blue-500 cursor-pointer hover:text-blue-700 transition"
            onClick={() => onEdit(index)}
            title="Edit Item"
          >
            <FaPen />
          </span>

          <span
            className="text-red-500 cursor-pointer hover:text-red-700 transition"
            onClick={() => {
              setSelectedItemIndex(index);
              setIsModalOpen(true);
            }}
            title="Delete Item"
          >
            <FaTrashCan />
          </span>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-200 bg-white mt-8">
      <h2 className="text-lg font-bold text-gray-800 mb-5 border-b pb-2">
        All Items
      </h2>

      <Table
        columns={columns}
        dataSource={items.map((item) => ({
          ...item,
          key: item.itemID,
        }))}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          responsive: true,
        }}
        bordered={false}
        scroll={{ x: "max-content" }}
        className="ant-table-striped ant-table-hover ant-table-responsive"
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
            <div className="flex gap-3 justify-end mt-2">
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
            </div>
          }
        />
      )}
    </div>
  );
};

export default ViewAllItems;
